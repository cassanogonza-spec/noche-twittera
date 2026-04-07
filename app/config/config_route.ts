import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

const DEFAULT_CONFIG = {
  base: 20,
  tv: 3,
  politica: 5,
  futbol: 2,
  famosos: 3,
  override: false,
};

export async function GET() {
  try {
    const config = await redis.get("noche-twittera-config");
    return NextResponse.json(config ?? DEFAULT_CONFIG);
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("x-admin-key");
  if (authHeader !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  await redis.set("noche-twittera-config", body);
  return NextResponse.json({ ok: true });
}
