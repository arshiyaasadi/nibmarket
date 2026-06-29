import { NextResponse } from "next/server";

export async function proxyToBackend(
  _req: Request,
  segments: string[],
): Promise<Response> {
  const path = `/${segments.join("/")}`;
  return NextResponse.json(
    { error: "not_found", message: `No Prisma handler registered for ${path}` },
    { status: 404 },
  );
}
