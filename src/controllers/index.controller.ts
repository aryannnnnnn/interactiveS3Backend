import type { Request, Response } from "express";
import {
  ListBucketsCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  type ListBucketsCommandOutput,
  type ListObjectsV2CommandOutput,
  type DeleteObjectCommandOutput,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  deleteFileSchema,
  getFilesSchema,
  loginSchema,
  uploadFileSchema,
  viewFileSchema,
} from "../schema/zod.schema.js";
import * as z from "zod";
import jwt from "jsonwebtoken";
import { encrypt } from "../services/crypto.service.js";
import type { serverError } from "../Intefaces/app.Interface.js";

export const handleGetBucket = async (req: Request, res: Response) => {
  try {
    const bucketList: ListBucketsCommandOutput = await req.client.send(
      new ListBucketsCommand({}),
    );
    if (bucketList.Buckets?.length) {
      res.json({
        msg: "Success",
        data: bucketList.Buckets.map((b) => b.Name),
      });
      return;
    }
    res.json({});
  } catch (Error) {
    res.status(404).json({
      msg: "Error",
      Error,
    });
  }
};

export const handleFiles = async (req: Request, res: Response) => {
  const payload: z.infer<typeof getFilesSchema> = {
    bucketName: req.query.bucketName as string,
    prefix: req.query.prefix as string,
    delimeter: req.query.delimeter as string,
  };
  try {
    const files: ListObjectsV2CommandOutput = await req.client.send(
      new ListObjectsV2Command({
        Bucket: payload.bucketName,
        Prefix: payload.prefix,
        Delimiter: payload.delimeter,
      }),
    );
    if (files.Contents?.length || files.CommonPrefixes?.length) {
      res.json({
        msg: "Success",
        data: {
          files: files.Contents?.map((file) => {
            return {
              name: file.Key,
              size: file.Size,
              lastModified: file.LastModified,
              owner: file.Owner,
            };
          }),
          folders: files.CommonPrefixes?.map((file) => file.Prefix),
        },
      });
      return;
    }
    res.json({});
  } catch (Error) {
    res.status(404).json({
      msg: "Error",
      Error,
    });
  }
};

export const handleDeleteFile = async (req: Request, res: Response) => {
  const payload: z.infer<typeof deleteFileSchema> = {
    bucketName: req.query.bucketName as string,
    key: req.query.key as string,
  };
  try {
    const resp: DeleteObjectCommandOutput = await req.client.send(
      new DeleteObjectCommand({
        Bucket: payload.bucketName,
        Key: payload.key,
      }),
    );
    if (resp.$metadata.httpStatusCode === 204) {
      res.status(204).json({
        msg: "Success",
        data: "File was deleted successfully",
      });
      return;
    }
    res.status(401).json({
      msg: "Unknown",
      data: "Unable to Delete File",
    });
  } catch (Error) {
    res.status(404).json({
      msg: "Error",
      Error,
    });
  }
};

export const handleViewFile = async (req: Request, res: Response) => {
  const payload: z.infer<typeof viewFileSchema> = req.body;
  try {
    let signedUrlList = [];
    const promises = payload.files.map(async (file) => {
      return {
        key: file.key,
        url: await getSignedUrl(
          req.client,
          new GetObjectCommand({
            Bucket: payload.bucketName,
            Key: file.key,
            ResponseContentDisposition: "inline",
          }),
          {
            expiresIn: Number(file.expiresIn) || 300,
          },
        ),
      };
    });

    signedUrlList = await Promise.allSettled(promises);

    res.json(
      signedUrlList.map((obj) => (obj.status == "fulfilled" ? obj.value : {})),
    );
  } catch (Error) {
    res.status(404).json({
      msg: "Error",
      Error,
    });
  }
};

export const handleGetUploadFileUrl = async (req: Request, res: Response) => {
  const payload: z.infer<typeof uploadFileSchema> = req.body;
  try {
    let signedUrlList = [];
    const promises = payload.files.map(async (file) => {
      return {
        key: file.key,
        url: await getSignedUrl(
          req.client,
          new PutObjectCommand({
            Bucket: payload.bucketName,
            Key: file?.key,
            ContentType: file?.contentType,
          }),
          {
            expiresIn: Number(file?.expiresIn) || 900,
          },
        ),
      };
    });

    signedUrlList = await Promise.allSettled(promises);

    res.json(
      signedUrlList.map((obj) => (obj.status == "fulfilled" ? obj.value : {})),
    );
  } catch (Error) {
    res.status(404).json({
      msg: "Error",
      Error,
    });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const payload: z.infer<typeof loginSchema> = req.body;
  try {
    const client: S3Client = new S3Client({
      region: payload.region,
      credentials: {
        accessKeyId: payload.accessToken,
        secretAccessKey: payload.secretAccessKey,
      },
    });
    const checkCredential = await client.send(new ListBucketsCommand({}));
    if (!checkCredential?.Owner) {
      res.status(401).json({
        msg: "Bad Request",
        data: "Could not connect to S3",
      });
    }
    const jwtPayload = encrypt(JSON.stringify(payload));
    const token = jwt.sign(
      { jwtPayload },
      String(process.env.JWT_SECRET_TOKEN),
      {
        algorithm: "HS256",
        expiresIn: "1h",
      },
    );
    res.json({ token: token });
  } catch (Error) {
    if (Error instanceof S3ServiceException) {
      const serverErr: serverError = {
        status: Error.$metadata.httpStatusCode || 403,
        code: Error.name,
        error: Error.stack,
        message: Error.message,
        timestamp: new Date(),
      };
      res.status(serverErr.status || 403).json(serverErr);
    }
    res.status(404).json({
      msg: "Error",
      data: Error,
    });
  }
};
