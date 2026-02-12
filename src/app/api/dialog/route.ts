import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(req: Request) {
  const { type } = await req.json();

  const script =
    type === "folder"
      ? 'POSIX path of (choose folder with prompt "Select KB folder")'
      : 'POSIX path of (choose file with prompt "Select output.jsonl")';

  try {
    const result = execSync(`osascript -e '${script}'`, {
      encoding: "utf-8",
      timeout: 60_000,
    }).trim();
    return NextResponse.json({ path: result });
  } catch {
    // User cancelled the dialog (osascript exits non-zero)
    return NextResponse.json({ cancelled: true });
  }
}
