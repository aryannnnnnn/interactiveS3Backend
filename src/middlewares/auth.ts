import type { Request, Response, NextFunction } from "express";
import { decrypt } from "../services/crypto.service.js";
import jwt from "jsonwebtoken";
import type { jwtDecoded, serverError } from "../Intefaces/app.Interface.js";
import { S3Client } from "@aws-sdk/client-s3";
import * as z from "zod";
import type { loginSchema } from "../schema/zod.schema.js";
import { errorHandler } from "../services/error.service.js";

export const authCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      res.status(401).json({
        status: 401,
        code: "AuthorizationError",
        message: "Please Provide Valid Credentials",
        error: "Plase Provide Valid Credentials",
        timestamp: new Date(),
      } as serverError);
      return;
    }
    const jwtToken: string = String(process.env.JWT_SECRET_TOKEN);
    const token = req.headers.authorization.split(" ")[1] as string;
    const decodeToken: jwtDecoded = jwt.verify(token, jwtToken) as jwtDecoded;
    const decryptedPayload: z.infer<typeof loginSchema> = JSON.parse(
      decrypt(decodeToken.jwtPayload),
    );
    req.client = new S3Client({
      region: decryptedPayload.region,
      credentials: {
        secretAccessKey: decryptedPayload.secretAccessKey,
        accessKeyId: decryptedPayload.accessToken,
      },
    });
    next();
  } catch (e) {
    const resp = errorHandler(e);
    res.status(resp.status || 404).json(resp);
  }
};
