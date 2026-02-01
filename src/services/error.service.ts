import { ZodError } from "zod";
import type { serverError, messageError } from "../Intefaces/app.Interface.js";
import { S3ServiceException } from "@aws-sdk/client-s3";
import jwt from "jsonwebtoken";

export const errorHandler = (
  e: S3ServiceException | Error | unknown,
): serverError => {
  if (e instanceof S3ServiceException) {
    const serverErr: serverError = {
      status: e.$metadata.httpStatusCode || 403,
      code: e.name,
      error: e.stack,
      message: e.message,
      timestamp: new Date(),
    };
    return serverErr;
  } else if (e instanceof ZodError) {
    console.log(e.issues);
    const serverErr: serverError = {
      status: 422,
      code: "ValidationError",
      message: e.issues.map((E): messageError => {
        return { field: E.path.join(","), message: E.message };
      }),
      error: e.message,
      timestamp: new Date(),
    };
    return serverErr;
  } else if (
    e instanceof jwt.TokenExpiredError ||
    e instanceof jwt.JsonWebTokenError
  ) {
    const serverErr: serverError = {
      status: 403,
      code: e.name,
      message: e.message,
      error: e.stack,
      timestamp: new Date(),
    };
    return serverErr;
  }
  const serverErr: serverError = {
    status: 404,
    code: "Error",
    message: JSON.stringify(e),
    error: JSON.stringify(e),
    timestamp: new Date(),
  };
  return serverErr;
};
