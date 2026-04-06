import { Storage } from "@google-cloud/storage";

const credentials = JSON.parse(
  Buffer.from(process.env.GCS_KEY_BASE64 || "", "base64").toString()
);
const storage = new Storage({ credentials });
const bucket = storage.bucket(process.env.GCS_BUCKET || "seoulface-data");

const INDEX_FILE = "chat/index.json";
const STATUS_FILE = "chat/admin-status.json";

export interface ChatMessage {
  id: string;
  roomId: string;
  from: "user" | "admin";
  text: string;
  timestamp: number;
}

export interface UserInfo {
  email?: string;
  skinType?: string;
  skinScore?: number;
  skinAge?: number;
  country?: string;
}

export interface ChatRoom {
  id: string;
  userName: string;
  userInfo: UserInfo;
  lastMessage: string;
  lastTime: number;
  unread: number;
  archived: boolean;
  createdAt: number;
  messages: ChatMessage[];
}

interface RoomIndex {
  id: string;
  userName: string;
  userInfo: UserInfo;
  lastMessage: string;
  lastTime: number;
  unread: number;
  archived: boolean;
  createdAt: number;
}

interface IndexData {
  rooms: Record<string, RoomIndex>;
}

interface AdminStatus {
  online: boolean;
  lastSeen: number;
}

// ====== GCS helpers ======

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

// ====== Admin status ======

export async function setAdminOnline(online: boolean): Promise<void> {
  await writeJSON(STATUS_FILE, { online, lastSeen: Date.now() });
}

export async function isAdminOnline(): Promise<boolean> {
  const status = await readJSON<AdminStatus>(STATUS_FILE, { online: false, lastSeen: 0 });
  return status.online && Date.now() - status.lastSeen < 30000;
}

export async function updateAdminHeartbeat(): Promise<void> {
  await writeJSON(STATUS_FILE, { online: true, lastSeen: Date.now() });
}

// ====== Room index (lightweight, no messages) ======

async function loadIndex(): Promise<IndexData> {
  return readJSON<IndexData>(INDEX_FILE, { rooms: {} });
}

async function saveIndex(data: IndexData): Promise<void> {
  await writeJSON(INDEX_FILE, data);
}

function roomPath(roomId: string): string {
  return `chat/rooms/${roomId}.json`;
}

// ====== Room operations ======

export async function getRoom(roomId: string): Promise<ChatRoom | null> {
  return readJSON<ChatRoom | null>(roomPath(roomId), null);
}

export async function getAllRooms(includeArchived = false): Promise<RoomIndex[]> {
  const index = await loadIndex();
  const rooms = Object.values(index.rooms);
  const filtered = includeArchived ? rooms : rooms.filter((r) => !r.archived);
  return filtered.sort((a, b) => b.lastTime - a.lastTime);
}

export async function addMessage(
  roomId: string,
  from: "user" | "admin",
  text: string,
  userName?: string,
  userInfo?: UserInfo
): Promise<ChatMessage> {
  const msg: ChatMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    roomId,
    from,
    text,
    timestamp: Date.now(),
  };

  // Load or create room
  let room = await readJSON<ChatRoom | null>(roomPath(roomId), null);
  if (!room) {
    room = {
      id: roomId,
      userName: userName || "Guest",
      userInfo: userInfo || {},
      lastMessage: text,
      lastTime: Date.now(),
      unread: 0,
      archived: false,
      createdAt: Date.now(),
      messages: [],
    };
  }

  // Update user info if provided (user might analyze after chatting)
  if (userInfo) {
    room.userInfo = { ...room.userInfo, ...userInfo };
  }
  if (userName && userName !== "Guest") {
    room.userName = userName;
  }

  room.messages.push(msg);
  room.lastMessage = text;
  room.lastTime = Date.now();
  if (from === "user") room.unread++;

  // Keep max 200 messages
  if (room.messages.length > 200) {
    room.messages = room.messages.slice(-200);
  }

  // Save room file + update index in parallel
  const index = await loadIndex();
  index.rooms[roomId] = {
    id: room.id,
    userName: room.userName,
    userInfo: room.userInfo,
    lastMessage: room.lastMessage,
    lastTime: room.lastTime,
    unread: room.unread,
    archived: room.archived,
    createdAt: room.createdAt,
  };

  await Promise.all([writeJSON(roomPath(roomId), room), saveIndex(index)]);
  return msg;
}

export async function markRoomRead(roomId: string): Promise<void> {
  const [room, index] = await Promise.all([
    readJSON<ChatRoom | null>(roomPath(roomId), null),
    loadIndex(),
  ]);

  if (!room) return;
  room.unread = 0;
  if (index.rooms[roomId]) index.rooms[roomId].unread = 0;

  await Promise.all([writeJSON(roomPath(roomId), room), saveIndex(index)]);
}

export async function archiveRoom(roomId: string): Promise<void> {
  const [room, index] = await Promise.all([
    readJSON<ChatRoom | null>(roomPath(roomId), null),
    loadIndex(),
  ]);

  if (!room) return;
  room.archived = true;
  if (index.rooms[roomId]) index.rooms[roomId].archived = true;

  await Promise.all([writeJSON(roomPath(roomId), room), saveIndex(index)]);
}
