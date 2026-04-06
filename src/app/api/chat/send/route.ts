import { NextRequest } from "next/server";
import { addMessage, markRoomRead } from "@/lib/chatStore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { roomId, message } = await request.json();
  if (!roomId || !message) {
    return Response.json({ error: "Missing roomId or message" }, { status: 400 });
  }

  const msg = await addMessage(roomId, "admin", message);
  await markRoomRead(roomId);
  return Response.json({ ok: true, message: msg });
}
