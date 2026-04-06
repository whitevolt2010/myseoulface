import { NextRequest } from "next/server";
import { updateAdminHeartbeat, setAdminOnline, isAdminOnline } from "@/lib/chatStore";

// 관리자 heartbeat / 상태 변경
export async function POST(request: NextRequest) {
  const { action } = await request.json();

  if (action === "heartbeat") {
    updateAdminHeartbeat();
  } else if (action === "offline") {
    setAdminOnline(false);
  }

  return Response.json({ adminOnline: isAdminOnline() });
}

// 온라인 상태 확인
export async function GET() {
  return Response.json({ adminOnline: isAdminOnline() });
}
