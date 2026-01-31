import { ZodError } from "zod";
import type { serverError, messageError } from "../Intefaces/app.Interface.js";
import { S3ServiceException } from "@aws-sdk/client-s3";

export const errorHandler = (
  Error: S3ServiceException | Error | unknown,
): serverError => {
  if (Error instanceof S3ServiceException) {
    const serverErr: serverError = {
      status: Error.$metadata.httpStatusCode || 403,
      code: Error.name,
      error: Error.stack,
      message: Error.message,
      timestamp: new Date(),
    };
    return serverErr;
  }
  else if (Error instanceof ZodError) {
    console.log(Error.issues)
    const serverErr: serverError = {
      status: 422,
      code: "ValidationError",
      message: Error.issues
        .map((E): messageError => { return { field: E.path.join(','), message: E.message } }),
      error: Error.message,
      timestamp: new Date(),

    }
    return serverErr;
  }
  const serverErr: serverError = {
    status: 404,
    code: "Error",
    message: JSON.stringify(Error),
    error: JSON.stringify(Error),
    timestamp: new Date(),
  };
  return serverErr;
};
