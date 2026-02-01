import type { Request, Response, NextFunction } from "express";
import { type ZodType } from "zod";
import { errorHandler } from "../services/error.service.js";

export const validator = (
  schemaType: "query" | "body" | "params",
  schema: ZodType,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[schemaType]);
      next();
    } catch (e) {
      const resp = errorHandler(e);
      res.status(resp.status || 404).json(resp);
    }
  };
};
