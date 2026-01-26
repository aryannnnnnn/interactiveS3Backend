import { Router } from "express";
import {
  handleGetBucket,
  handleFiles,
  handleDeleteFile,
  handleViewFile,
  handleGetUploadFileUrl,
} from "../controllers/index.controller.js";
import type { routerConfig } from "../Intefaces/app.Interface.ts";
import {
  deleteFileSchema,
  getFilesSchema,
  uploadFileSchema,
  viewFileSchema,
} from "../schema/zod.schema.js";

const router = Router();

export const routeList: routerConfig[] = [
  {
    route: "/get-buckets",
    method: "get",
    handler: handleGetBucket,
    authRequired: true,
  },
  {
    route: "/files",
    method: "get",
    handler: handleFiles,
    schemaConfig: {
      schemaType: "query",
      schema: getFilesSchema,
    },
    authRequired: true,
  },
  {
    route: "/view-file",
    method: "post",
    handler: handleViewFile,
    schemaConfig: {
      schemaType: "body",
      schema: viewFileSchema,
    },
    authRequired: true,
  },
  {
    route: "/get-upload-file-url",
    method: "post",
    handler: handleGetUploadFileUrl,
    schemaConfig: {
      schemaType: "body",
      schema: uploadFileSchema,
    },
    authRequired: true,
  },
  {
    route: "/delete-file",
    method: "delete",
    handler: handleDeleteFile,
    schemaConfig: {
      schemaType: "query",
      schema: deleteFileSchema,
    },
    authRequired: true,
  },
];

export default router;
