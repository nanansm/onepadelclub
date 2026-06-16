import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.R2_ENDPOINT;
const bucket = process.env.R2_BUCKET_NAME;

// Mock mode: kalau env R2 kosong, simpan ke public/uploads (dev tanpa R2).
export const r2Configured = Boolean(
  accessKeyId && secretAccessKey && endpoint && bucket,
);

const client = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    })
  : null;

const MOCK_DIR = path.join(process.cwd(), "public", "uploads");

// Proses + simpan gambar. Resize maks 512px, JPEG q80. Return { key, url }.
export async function uploadImage(
  input: Buffer,
  keyPrefix: string,
): Promise<{ key: string; url: string }> {
  const processed = await sharp(input)
    .rotate()
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const key = `${keyPrefix}/${crypto.randomUUID()}.jpg`;

  if (!r2Configured || !client) {
    const full = path.join(MOCK_DIR, key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, processed);
    return { key, url: `/uploads/${key}` };
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      Body: processed,
      ContentType: "image/jpeg",
    }),
  );
  // Disajikan lewat proxy publik (bucket privat).
  return { key, url: `/api/img/${key}` };
}

// Stream objek dari R2 untuk proxy. Mock: baca dari public/uploads.
export async function getImage(
  key: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  if (!r2Configured || !client) {
    try {
      const body = await readFile(path.join(MOCK_DIR, key));
      return { body, contentType: "image/jpeg" };
    } catch {
      return null;
    }
  }
  try {
    const res = await client.send(
      new GetObjectCommand({ Bucket: bucket!, Key: key }),
    );
    const bytes = await res.Body!.transformToByteArray();
    return { body: Buffer.from(bytes), contentType: res.ContentType ?? "image/jpeg" };
  } catch {
    return null;
  }
}
