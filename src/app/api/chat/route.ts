import { NextRequest } from "next/server";
import { addMessage, isAdminOnline, getRoom } from "@/lib/chatStore";

export const dynamic = "force-dynamic";

// 고객이 메시지 보내기
export async function POST(request: NextRequest) {
  const { roomId, message, userName } = await request.json();
  if (!roomId || !message) {
    return Response.json({ error: "Missing roomId or message" }, { status: 400 });
  }

  const msg = await addMessage(roomId, "user", message, userName);
  const online = await isAdminOnline();
  return Response.json({ ok: true, message: msg, adminOnline: online });
}

// 고객이 메시지 폴링
export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");
  const after = parseInt(request.nextUrl.searchParams.get("after") || "0");

  if (!roomId) {
    return Response.json({ error: "Missing roomId" }, { status: 400 });
  }

  const room = await getRoom(roomId);
  const messages = room?.messages.filter((m) => m.timestamp > after) || [];
  const online = await isAdminOnline();

  return Response.json({ messages, adminOnline: online });
}
