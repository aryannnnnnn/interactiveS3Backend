import * as z from "zod";

export const getFilesSchema = z
  .object({
    bucketName: z.string(),
    prefix: z.string().default(""),
    delimeter: z.string().default("/"),
  })
  .required({ bucketName: true });

export const deleteFileSchema = z
  .object({
    bucketName: z.string(),
    key: z.string(),
  })
  .required();

export const viewFileSchema = z
  .object({
    bucketName: z.string(),
    files: z.array(
      z.object({
        key: z.string(),
        expiresIn: z.number().default(300),
      }),
    ),
  })
  .required({
    bucketName: true,
    files: true,
  });

export const uploadFileSchema = z
  .object({
    bucketName: z.string(),
    files: z.array(
      z.object({
        key: z.string(),
        contentType: z.string(),
        expiresIn: z.number().default(900),
      })
    ),
  })
  .required({
    bucketName: true,
    files: true,
  });

export const loginSchema = z
  .object({
    username: z.string(),
    secretAccessKey: z.string(),
    accessToken: z.string(),
    region: z.string(),
  })
  .required();

export default {
  deleteFileSchema,
  getFilesSchema,
  uploadFileSchema,
  viewFileSchema,
  loginSchema,
};
