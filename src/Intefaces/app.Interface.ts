import type { Request, Response } from "express";
import type { ZodType } from "zod";
import type { S3Client } from "@aws-sdk/client-s3";

export interface routerConfig {
  route: string;
  method: "get" | "post" | "put" | "delete";
  handler: (req: Request, res: Response) => Promise<void> | void;
  schemaConfig?: {
    schemaType: "query" | "body" | "params";
    schema: ZodType;
  };
  authRequired: boolean;
}

export interface jwtDecoded {
  jwtPayload: string;
  iat: number;
  exp: number;
}

export interface serverError {
  status: number | undefined;
  error: string | undefined;
  message: string | messageError[] | undefined;
  code: string | undefined;
  timestamp: Date | undefined;
}

export interface messageError {
  field: string,
  message: string
}

declare global {
  namespace Express {
    interface Request {
      client: S3Client;
    }
  }
}
