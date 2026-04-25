import crypto from "node:crypto";

type Classification = "public" | "restricted" | "secret";

export type AuditClassificationMap = Record<string, Classification>;

export function redactAndEncryptAuditPayload(
  payload: Record<string, unknown>,
  classification: AuditClassificationMap,
  encryptionKey: string
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    const className = classification[key] || "public";
    if (className === "public") {
      output[key] = value;
      continue;
    }

    if (className === "restricted") {
      output[key] = hashValue(value);
      continue;
    }

    output[key] = encryptValue(String(value), encryptionKey);
  }

  return output;
}

function hashValue(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function encryptValue(value: string, keyMaterial: string): string {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash("sha256").update(keyMaterial).digest();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}
