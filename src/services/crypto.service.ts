import * as crypto from "crypto";

export const encrypt = (payload: string) => {
  const encryptionKey = String(process.env.ENCRYPTION_SECRET_TOKEN);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  let encrypted = cipher.update(payload, "utf-8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, Buffer.from(encrypted, "hex"), authTag]).toString(
    "base64",
  );
};

export const decrypt = (payload: string) => {
  const encryptionKey = String(process.env.ENCRYPTION_SECRET_TOKEN);
  const dataBuffer = Buffer.from(payload, "base64");
  const iv = dataBuffer.subarray(0, 16);
  const authTag = dataBuffer.subarray(dataBuffer.length - 16);
  const encryptedText = dataBuffer.subarray(16, dataBuffer.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, undefined, "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

export default { crypto, decrypt };
