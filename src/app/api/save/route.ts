import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { novelData } = body;
    
    if (!novelData) {
      return NextResponse.json({ error: "Missing novelData" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "src", "data", "novelData.json");
    fs.writeFileSync(filePath, JSON.stringify(novelData, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error writing novel JSON:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
