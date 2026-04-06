import { NextRequest } from "next/server";
import { addMessage, isAdminOnline } from "@/lib/chatStore";

// 고객이 메시지 보내기
export async function POST(request: NextRequest) {
  const { roomId, message, userName } = await request.json();
  if (!roomId || !message) {
    return Response.json({ error: "Missing roomId or message" }, { status: 400 });
  }

  const msg = addMessage(roomId, "user", message, userName);
  return Response.json({ ok: true, message: msg, adminOnline: isAdminOnline() });
}

// 고객이 메시지 폴링 (새 관리자 답변 확인)
export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");
  const after = parseInt(request.nextUrl.searchParams.get("after") || "0");

  if (!roomId) {
    return Response.json({ error: "Missing roomId" }, { status: 400 });
  }

  const { getRoom } = await import("@/lib/chatStore");
  const room = getRoom(roomId);
  const messages = room?.messages.filter((m) => m.timestamp > after) || [];

  return Response.json({ messages, adminOnline: isAdminOnline() });
}
