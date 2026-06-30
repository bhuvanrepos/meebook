"use client";

import React, { useEffect, useRef } from "react";
import { useNovel } from "@/context/NovelContext";

type AudioTrackType = 'metro' | 'rain' | 'temple' | 'wind' | 'birds' | 'hospital' | 'keyboard' | 'night' | 'silence';

export const AmbientAudio: React.FC = () => {
  const { isBhavamOn, bhavamVolume, novelData, currentChapterIndex, currentPageIndex } = useNovel();
  
  // Track state
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const currentSoundSourceRef = useRef<any>(null); // holds reference to active synth nodes
  const currentTrackRef = useRef<AudioTrackType>('silence');

  // Determine what track should be playing right now
  let activeTrack: AudioTrackType = 'silence';
  try {
    const chapter = novelData.chapters[currentChapterIndex];
    if (chapter) {
      const page = chapter.pages[currentPageIndex];
      if (page && page.audio) {
        activeTrack = page.audio;
      }
    }
  } catch (err) {
    console.error("Error reading audio track from context", err);
  }

  // Initialize Audio Context on click/interaction if needed
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(isBhavamOn ? bhavamVolume : 0, ctx.currentTime);
      
      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
    }
    
    // Resume context if suspended (browser security autoplay policy)
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Trigger init on user toggle
  useEffect(() => {
    if (isBhavamOn) {
      initAudio();
    }
  }, [isBhavamOn]);

  // Handle master volume adjustments
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const targetVolume = isBhavamOn ? bhavamVolume : 0;
      masterGainRef.current.gain.linearRampToValueAtTime(
        targetVolume, 
        audioCtxRef.current.currentTime + 0.5
      );
    }
  }, [isBhavamOn, bhavamVolume]);

  // Handle track changing with smooth crossfade
  useEffect(() => {
    if (!isBhavamOn) {
      // If Bhavam is OFF, stop any running synths immediately or fade master to 0
      return;
    }

    if (!audioCtxRef.current || !masterGainRef.current) {
      initAudio();
    }

    if (audioCtxRef.current && activeTrack !== currentTrackRef.current) {
      transitionToTrack(activeTrack);
    }
  }, [activeTrack, isBhavamOn]);

  // Audio synthesis helper functions
  const createNoiseBuffer = (ctx: AudioContext, type: 'white' | 'pink' | 'brown') => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; // pink noise state variables
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      if (type === 'white') {
        output[i] = white;
      } else if (type === 'pink') {
        // Pink noise approximation filter
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // normalisation
        b6 = white * 0.115926;
      } else if (type === 'brown') {
        // Brown noise: accumulate random walk
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // normalisation
      }
    }
    
    return noiseBuffer;
  };

  // Synthesis engine for different ambience sounds
  const startSynthesizer = (ctx: AudioContext, type: AudioTrackType, targetGainNode: GainNode) => {
    const activeNodes: any[] = [];
    let intervalId: any = null;

    if (type === 'silence') {
      // Do nothing, silence is golden
      return { nodes: [], stop: () => {} };
    }

    if (type === 'rain') {
      // 1. Continuous soft brown noise for background rainfall rumble
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 'brown');
      noise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.35;

      noise.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(targetGainNode);
      noise.start();
      activeNodes.push(noise);

      // 2. Occasional raindrop spatters hitting glass (short envelope clicks)
      const raindropInterval = setInterval(() => {
        if (ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + Math.random() * 1200, ctx.currentTime);
        // Fast pitch slide down (like a drop landing)
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

        oscGain.gain.setValueAtTime(0, ctx.currentTime);
        oscGain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.08, ctx.currentTime + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(oscGain);
        oscGain.connect(targetGainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }, 90);

      intervalId = raindropInterval;
    }

    else if (type === 'wind') {
      // Warm gusty wind: pink noise modulated by filter sweeps
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 'pink');
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 2.0;
      filter.frequency.value = 350;

      // Slow wind swell LFO
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08; // slow cycles
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 220; // range of cutoff sweep

      const windGain = ctx.createGain();
      windGain.gain.value = 0.6;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      noise.connect(filter);
      filter.connect(windGain);
      windGain.connect(targetGainNode);

      lfo.start();
      noise.start();
      
      activeNodes.push(lfo, noise);
    }

    else if (type === 'metro') {
      // 1. Heavy low frequency engine hum
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const humGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 hum
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110.5, ctx.currentTime); // Slight detune

      filter.type = 'lowpass';
      filter.frequency.value = 90; // deep filter

      humGain.gain.value = 0.35;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(humGain);
      humGain.connect(targetGainNode);
      
      osc1.start();
      osc2.start();
      activeNodes.push(osc1, osc2);

      // 2. Track clatters repeating in cycles (chug-chug)
      const chug = setInterval(() => {
        if (ctx.state === 'closed') return;
        const now = ctx.currentTime;
        // Schedule double click sound
        [0, 0.12].forEach((offset) => {
          const clickOsc = ctx.createOscillator();
          const clickFilter = ctx.createBiquadFilter();
          const clickGain = ctx.createGain();

          clickOsc.type = 'triangle';
          clickOsc.frequency.setValueAtTime(60, now + offset);
          clickOsc.frequency.exponentialRampToValueAtTime(12, now + offset + 0.1);

          clickFilter.type = 'lowpass';
          clickFilter.frequency.value = 250;

          clickGain.gain.setValueAtTime(0, now + offset);
          clickGain.gain.linearRampToValueAtTime(0.12, now + offset + 0.01);
          clickGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

          clickOsc.connect(clickFilter);
          clickFilter.connect(clickGain);
          clickGain.connect(targetGainNode);
          clickOsc.start(now + offset);
          clickOsc.stop(now + offset + 0.12);
        });
      }, 1800);

      intervalId = chug;
    }

    else if (type === 'temple') {
      // Low meditation hum
      const drone = ctx.createOscillator();
      const droneGain = ctx.createGain();
      drone.type = 'sine';
      drone.frequency.value = 135; // quiet drone
      droneGain.gain.value = 0.08;
      drone.connect(droneGain);
      droneGain.connect(targetGainNode);
      drone.start();
      activeNodes.push(drone);

      // Periodic resonant bell ringing
      const ringBell = () => {
        if (ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const f0 = 261.63; // Middle C (Sa)
        
        // Bell consists of multiple sinusoids (harmonics)
        const partials = [1, 2, 3, 4.2, 5.4, 6.8];
        const weights = [1.0, 0.6, 0.45, 0.3, 0.15, 0.1];
        
        partials.forEach((part, index) => {
          const osc = ctx.createOscillator();
          const pGain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.value = f0 * part;
          
          // Exponential decay decay proportional to index
          const decayTime = 5.0 / (index * 0.5 + 1);
          
          pGain.gain.setValueAtTime(0, now);
          pGain.gain.linearRampToValueAtTime(weights[index] * 0.09, now + 0.05);
          pGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);
          
          osc.connect(pGain);
          pGain.connect(targetGainNode);
          osc.start(now);
          osc.stop(now + decayTime + 0.1);
        });
      };

      // Ring immediately, then set interval
      ringBell();
      const bellInterval = setInterval(ringBell, 7000);
      intervalId = bellInterval;
    }

    else if (type === 'birds') {
      // Quiet background forest breeze (very light white noise)
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 'white');
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 1200;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.05;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(targetGainNode);
      noise.start();
      activeNodes.push(noise);

      // High chirping synthesizer
      const chirp = () => {
        if (ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const count = 2 + Math.floor(Math.random() * 4); // 2-5 chirps
        let startOffset = 0;

        for (let i = 0; i < count; i++) {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          
          osc.type = 'sine';
          const baseFreq = 2200 + Math.random() * 800;
          osc.frequency.setValueAtTime(baseFreq, now + startOffset);
          // Quick pitch sweep upwards
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + startOffset + 0.06);

          oscGain.gain.setValueAtTime(0, now + startOffset);
          oscGain.gain.linearRampToValueAtTime(0.02, now + startOffset + 0.01);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + 0.06);

          osc.connect(oscGain);
          oscGain.connect(targetGainNode);
          osc.start(now + startOffset);
          osc.stop(now + startOffset + 0.07);

          startOffset += 0.08 + Math.random() * 0.05;
        }
      };

      // Call periodically
      const chirpInterval = setInterval(chirp, 4500);
      intervalId = chirpInterval;
    }

    else if (type === 'hospital') {
      // 1. Low HVAC hum
      const osc = ctx.createOscillator();
      const humGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, ctx.currentTime); // 60Hz wall hum
      humGain.gain.value = 0.15;
      osc.connect(humGain);
      humGain.connect(targetGainNode);
      osc.start();
      activeNodes.push(osc);

      // 2. Slow periodic diagnostic monitor beep (Sa)
      const beepInterval = setInterval(() => {
        if (ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const beepOsc = ctx.createOscillator();
        const beepGain = ctx.createGain();

        beepOsc.type = 'sine';
        beepOsc.frequency.setValueAtTime(987.77, now); // B5 high tone
        
        beepGain.gain.setValueAtTime(0, now);
        beepGain.gain.linearRampToValueAtTime(0.015, now + 0.01);
        beepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        beepOsc.connect(beepGain);
        beepGain.connect(targetGainNode);
        beepOsc.start(now);
        beepOsc.stop(now + 0.2);
      }, 3000);

      intervalId = beepInterval;
    }

    else if (type === 'keyboard') {
      // Keyboard typewriter clicks triggered randomly
      const typeLetters = setInterval(() => {
        if (ctx.state === 'closed') return;
        
        // Randomly skip beats to sound realistic
        if (Math.random() > 0.45) {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const bandpass = ctx.createBiquadFilter();
          const clickGain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100 + Math.random() * 300, now);
          osc.frequency.exponentialRampToValueAtTime(2000, now + 0.02);

          bandpass.type = 'bandpass';
          bandpass.Q.value = 8.0;
          bandpass.frequency.value = 1800 + Math.random() * 600;

          clickGain.gain.setValueAtTime(0, now);
          clickGain.gain.linearRampToValueAtTime(0.06, now + 0.005);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

          osc.connect(bandpass);
          bandpass.connect(clickGain);
          clickGain.connect(targetGainNode);
          osc.start(now);
          osc.stop(now + 0.04);
        }
      }, 150);

      intervalId = typeLetters;
    }

    else if (type === 'night') {
      // Cricket insect chirps (highly pulsed, filtered white noise)
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 'pink');
      noise.loop = true;

      const bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.Q.value = 18.0;
      bpFilter.frequency.setValueAtTime(4200, ctx.currentTime);

      const cricketGain = ctx.createGain();
      cricketGain.gain.value = 0.0;

      noise.connect(bpFilter);
      bpFilter.connect(cricketGain);
      cricketGain.connect(targetGainNode);
      noise.start();
      
      activeNodes.push(noise);

      // Program the rapid chirp pulses
      let pulseState = false;
      const cricketPulse = setInterval(() => {
        if (ctx.state === 'closed') return;
        const now = ctx.currentTime;
        
        // Chirp sequences occur in groups
        const nowSec = Date.now() / 1000;
        const silentCycle = Math.sin(nowSec * 0.4) < -0.2; // periodic cricket silence
        
        if (silentCycle) {
          cricketGain.gain.setValueAtTime(0, now);
          return;
        }

        pulseState = !pulseState;
        cricketGain.gain.setValueAtTime(pulseState ? 0.08 : 0.002, now);
      }, 60);

      intervalId = cricketPulse;
    }

    return {
      nodes: activeNodes,
      stop: () => {
        if (intervalId) clearInterval(intervalId);
        activeNodes.forEach(node => {
          try {
            node.stop();
          } catch(e) {}
        });
      }
    };
  };

  // Perform smooth transition from current track to new track
  const transitionToTrack = (track: AudioTrackType) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;

    const ctx = audioCtxRef.current;
    const fadeDuration = 1.2; // seconds
    const now = ctx.currentTime;

    // 1. Create a gain node for the old track and transfer nodes to it if they exist
    const oldSource = currentSoundSourceRef.current;
    
    if (oldSource && oldSource.gainNode) {
      // Fade out old track's sub gain node smoothly
      oldSource.gainNode.gain.setValueAtTime(oldSource.gainNode.gain.value, now);
      oldSource.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + fadeDuration);
      
      // Cleanup the nodes after fade out completes
      const nodesToCleanup = oldSource;
      setTimeout(() => {
        nodesToCleanup.stop();
      }, fadeDuration * 1000);
    }

    // 2. Create new track nodes connected to a new sub gain node
    const newGain = ctx.createGain();
    newGain.gain.setValueAtTime(0.0001, now);
    newGain.connect(masterGainRef.current);
    
    // Fade in new track's gain
    newGain.gain.exponentialRampToValueAtTime(1.0, now + fadeDuration);

    const synthDetails = startSynthesizer(ctx, track, newGain);
    
    currentSoundSourceRef.current = {
      gainNode: newGain,
      nodes: synthDetails.nodes,
      stop: () => {
        synthDetails.stop();
        try {
          newGain.disconnect();
        } catch (e) {}
      }
    };

    currentTrackRef.current = track;
  };

  // Stop everything when component unmounts or isBhavamOn turns OFF
  useEffect(() => {
    return () => {
      if (currentSoundSourceRef.current) {
        currentSoundSourceRef.current.stop();
        currentSoundSourceRef.current = null;
      }
      currentTrackRef.current = 'silence';
    };
  }, [isBhavamOn]);

  return null; // pure logic node
};
