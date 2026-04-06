// In-memory chat store (서버 재시작 시 초기화됨)
// 프로덕션에서는 Redis나 DB로 교체 가능

export interface ChatMessage {
  id: string;
  roomId: string;
  from: "user" | "admin";
  text: string;
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  userName: string;
  lastMessage: string;
  lastTime: number;
  unread: number;
  messages: ChatMessage[];
}

// 관리자 온라인 상태
let adminOnline = false;
let adminLastSeen = 0;

// 채팅방 저장소
const rooms = new Map<string, ChatRoom>();

export function setAdminOnline(online: boolean) {
  adminOnline = online;
  if (online) adminLastSeen = Date.now();
}

export function isAdminOnline(): boolean {
  // 30초 이내 heartbeat가 있으면 온라인
  return adminOnline && (Date.now() - adminLastSeen < 30000);
}

export function updateAdminHeartbeat() {
  adminLastSeen = Date.now();
  adminOnline = true;
}

export function getRoom(roomId: string): ChatRoom | undefined {
  return rooms.get(roomId);
}

export function getAllRooms(): ChatRoom[] {
  return Array.from(rooms.values()).sort((a, b) => b.lastTime - a.lastTime);
}

export function addMessage(roomId: string, from: "user" | "admin", text: string, userName?: string): ChatMessage {
  const msg: ChatMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    roomId,
    from,
    text,
    timestamp: Date.now(),
  };

  let room = rooms.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      userName: userName || "Guest",
      lastMessage: text,
      lastTime: Date.now(),
      unread: from === "user" ? 1 : 0,
      messages: [],
    };
    rooms.set(roomId, room);
  }

  room.messages.push(msg);
  room.lastMessage = text;
  room.lastTime = Date.now();
  if (from === "user") room.unread++;

  // 최대 200개 메시지만 유지
  if (room.messages.length > 200) {
    room.messages = room.messages.slice(-200);
  }

  return msg;
}

export function markRoomRead(roomId: string) {
  const room = rooms.get(roomId);
  if (room) room.unread = 0;
}
