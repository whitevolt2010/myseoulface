import { NextRequest } from "next/server";
import { addMessage, markRoomRead } from "@/lib/chatStore";

// 관리자가 답변 보내기
export async function POST(request: NextRequest) {
  const { roomId, message } = await request.json();
  if (!roomId || !message) {
    return Response.json({ error: "Missing roomId or message" }, { status: 400 });
  }

  const msg = addMessage(roomId, "admin", message);
  markRoomRead(roomId);
  return Response.json({ ok: true, message: msg });
}
