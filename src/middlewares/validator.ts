import type { Request, Response, NextFunction } from "express";
import { type ZodType, ZodError } from "zod";

export const validator = (
  schemaType: "query" | "body" | "params",
  schema: ZodType,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[schemaType]);
      next();
    } catch (Error) {
      console.log(Error);
      if (Error instanceof ZodError) {
        res.status(422).json({
          msg: "Error",
          ErrorType: "ValidationError",
          data: Error.issues.map((e) => e.message),
        });
      } else {
        res.status(400).json({
          msg: "Error",
          ErrorType: "UnknownError",
          data: Error,
        });
      }
    }
  };
};
