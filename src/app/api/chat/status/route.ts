import { NextRequest } from "next/server";
import { updateAdminHeartbeat, setAdminOnline, isAdminOnline } from "@/lib/chatStore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { action } = await request.json();

  if (action === "heartbeat") {
    await updateAdminHeartbeat();
  } else if (action === "offline") {
    await setAdminOnline(false);
  }

  const online = await isAdminOnline();
  return Response.json({ adminOnline: online });
}

export async function GET() {
  const online = await isAdminOnline();
  return Response.json({ adminOnline: online });
}
