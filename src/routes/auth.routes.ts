import type { routerConfig } from "../Intefaces/app.Interface.js";
import { handleLogin } from "../controllers/index.controller.js";
import { loginSchema } from "../schema/zod.schema.js";

export const authRouteList: routerConfig[] = [
  {
    route: "/login",
    handler: handleLogin,
    schemaConfig: {
      schemaType: "body",
      schema: loginSchema,
    },
    method: "post",
    authRequired: false,
  },
];
