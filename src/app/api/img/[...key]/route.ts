import { NextResponse } from "next/server";
import { getImage } from "@/lib/r2";

export const dynamic = "force-dynamic";

// Proxy publik untuk gambar di R2 (bucket privat). /api/img/<key...>
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");
  const img = await getImage(objectKey);
  if (!img) return NextResponse.json({ error: "not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(img.body), {
    headers: {
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
