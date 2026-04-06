import { Storage } from "@google-cloud/storage";

// GCS 기반 채팅 저장소 (서버리스에서도 영구 저장)
const credentials = JSON.parse(
  Buffer.from(process.env.GCS_KEY_BASE64 || "", "base64").toString()
);
const storage = new Storage({ credentials });
const bucket = storage.bucket(process.env.GCS_BUCKET || "seoulface-data");

const CHAT_FILE = "chat/rooms.json";
const STATUS_FILE = "chat/admin-status.json";

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

interface ChatData {
  rooms: Record<string, ChatRoom>;
}

interface AdminStatus {
  online: boolean;
  lastSeen: number;
}

// ====== GCS 읽기/쓰기 ======

async function readJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const [content] = await bucket.file(path).download();
    return JSON.parse(content.toString());
  } catch {
    return fallback;
  }
}

async function writeJSON(path: string, data: unknown): Promise<void> {
  await bucket.file(path).save(JSON.stringify(data), {
    contentType: "application/json",
  });
}

// ====== 관리자 상태 ======

export async function setAdminOnline(online: boolean): Promise<void> {
  await writeJSON(STATUS_FILE, { online, lastSeen: Date.now() });
}

export async function isAdminOnline(): Promise<boolean> {
  const status = await readJSON<AdminStatus>(STATUS_FILE, { online: false, lastSeen: 0 });
  return status.online && (Date.now() - status.lastSeen < 30000);
}

export async function updateAdminHeartbeat(): Promise<void> {
  await writeJSON(STATUS_FILE, { online: true, lastSeen: Date.now() });
}

// ====== 채팅방 ======

async function loadChat(): Promise<ChatData> {
  return readJSON<ChatData>(CHAT_FILE, { rooms: {} });
}

async function saveChat(data: ChatData): Promise<void> {
  await writeJSON(CHAT_FILE, data);
}

export async function getRoom(roomId: string): Promise<ChatRoom | null> {
  const data = await loadChat();
  return data.rooms[roomId] || null;
}

export async function getAllRooms(): Promise<ChatRoom[]> {
  const data = await loadChat();
  return Object.values(data.rooms).sort((a, b) => b.lastTime - a.lastTime);
}

export async function addMessage(
  roomId: string,
  from: "user" | "admin",
  text: string,
  userName?: string
): Promise<ChatMessage> {
  const data = await loadChat();

  const msg: ChatMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    roomId,
    from,
    text,
    timestamp: Date.now(),
  };

  if (!data.rooms[roomId]) {
    data.rooms[roomId] = {
      id: roomId,
      userName: userName || "Guest",
      lastMessage: text,
      lastTime: Date.now(),
      unread: 0,
      messages: [],
    };
  }

  const room = data.rooms[roomId];
  room.messages.push(msg);
  room.lastMessage = text;
  room.lastTime = Date.now();
  if (from === "user") room.unread++;

  // 최대 100개 메시지만 유지
  if (room.messages.length > 100) {
    room.messages = room.messages.slice(-100);
  }

  await saveChat(data);
  return msg;
}

export async function markRoomRead(roomId: string): Promise<void> {
  const data = await loadChat();
  if (data.rooms[roomId]) {
    data.rooms[roomId].unread = 0;
    await saveChat(data);
  }
}
