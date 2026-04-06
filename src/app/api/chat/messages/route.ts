import { NextRequest } from "next/server";
import { getAllRooms, getRoom, markRoomRead } from "@/lib/chatStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");

  if (roomId) {
    const room = await getRoom(roomId);
    if (room) await markRoomRead(roomId);
    return Response.json({ room: room || null });
  }

  const rooms = await getAllRooms();
  return Response.json({ rooms });
}
