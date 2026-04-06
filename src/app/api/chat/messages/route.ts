import { NextRequest } from "next/server";
import { getAllRooms, getRoom, markRoomRead, archiveRoom } from "@/lib/chatStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");
  const includeArchived = request.nextUrl.searchParams.get("archived") === "true";

  if (roomId) {
    const room = await getRoom(roomId);
    if (room) await markRoomRead(roomId);
    return Response.json({ room: room || null });
  }

  const rooms = await getAllRooms(includeArchived);
  return Response.json({ rooms });
}

export async function POST(request: NextRequest) {
  const { action, roomId } = await request.json();

  if (action === "archive" && roomId) {
    await archiveRoom(roomId);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
