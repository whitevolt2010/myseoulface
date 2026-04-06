import { NextRequest } from "next/server";
import { getAllRooms, getRoom, markRoomRead } from "@/lib/chatStore";

// 관리자: 모든 채팅방 목록 조회
export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");

  if (roomId) {
    // 특정 방의 메시지
    const room = getRoom(roomId);
    if (room) markRoomRead(roomId);
    return Response.json({ room: room || null });
  }

  // 전체 방 목록
  const rooms = getAllRooms();
  return Response.json({ rooms });
}
