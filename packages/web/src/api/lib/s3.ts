import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function putFile(key: string, body: Uint8Array, contentType: string) {
  await s3.send(
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
  return key;
}

const urlCache = new Map<string, { url: string; exp: number }>();

/** Presigned GET URL (7 days), cached in-process for a day so pages don't re-sign every load. */
export async function signedUrl(key: string) {
  const hit = urlCache.get(key);
  if (hit && hit.exp > Date.now()) return hit.url;
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }), {
    expiresIn: 60 * 60 * 24 * 7,
  });
  urlCache.set(key, { url, exp: Date.now() + 1000 * 60 * 60 * 24 });
  return url;
}

/** Walks any JSON value and adds `url` next to every `{ key: "generated/..." }` image object. */
export async function signImages<T>(value: T): Promise<T> {
  if (Array.isArray(value)) return (await Promise.all(value.map((v) => signImages(v)))) as T;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = await signImages(v);
    if (typeof obj.url === "string" && obj.url.length > 0) {
      out.url = obj.url;
    } else if (typeof obj.key === "string" && obj.key.startsWith("generated/")) {
      try {
        out.url = await signedUrl(obj.key);
      } catch {
        out.url = "";
      }
    }
    return out as T;
  }
  return value;
}
