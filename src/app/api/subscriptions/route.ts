import { NextRequest, NextResponse } from "next/server";
import { deleteSubscriber, getSubscriber, upsertSubscriber } from "@/lib/store";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const sub = getSubscriber(id);
  return NextResponse.json(sub ?? { id, investorSlugs: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.id || !Array.isArray(body.investorSlugs)) {
    return NextResponse.json({ error: "id, investorSlugs required" }, { status: 400 });
  }
  const saved = upsertSubscriber({
    id: String(body.id),
    investorSlugs: body.investorSlugs.map(String),
    email: body.email ? String(body.email) : undefined,
    pushSubscription: body.pushSubscription ?? undefined,
  });
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteSubscriber(id);
  return NextResponse.json({ ok: true });
}
