import { NextRequest } from "next/server";
import { saveAnalysisData } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { message, email } = await request.json();

    // GCS에 채팅 메시지 저장
    await saveAnalysisData({
      type: "chat",
      message,
      email: email || null,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
