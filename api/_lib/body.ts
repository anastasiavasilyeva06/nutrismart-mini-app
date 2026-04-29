import type { IncomingMessage } from "http";

export async function readJson(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

type MultipartResult = { fields: Record<string, string>; files: Record<string, { filename: string; mimeType: string; buffer: Buffer }> };

export async function parseMultipart(req: any, maxBytes = 10 * 1024 * 1024): Promise<MultipartResult> {
  const contentType = req.headers?.["content-type"] ?? "";
  if (!String(contentType).includes("multipart/form-data")) throw new Error("Expected multipart/form-data");

  const { default: Busboy } = await import("busboy");
  const busboy = Busboy({ headers: req.headers, limits: { fileSize: maxBytes } });

  const fields: Record<string, string> = {};
  const files: MultipartResult["files"] = {};

  const done = new Promise<MultipartResult>((resolve, reject) => {
    busboy.on("field", (name: string, val: string) => {
      fields[name] = val;
    });

    busboy.on("file", (name: string, file: any, info: any) => {
      const { filename, mimeType } = info;
      const bufs: Buffer[] = [];
      file.on("data", (d: Buffer) => bufs.push(d));
      file.on("limit", () => reject(new Error("File too large")));
      file.on("end", () => {
        files[name] = { filename, mimeType, buffer: Buffer.concat(bufs) };
      });
    });

    busboy.on("error", reject);
    busboy.on("finish", () => resolve({ fields, files }));
  });

  req.pipe(busboy);
  return done;
}

