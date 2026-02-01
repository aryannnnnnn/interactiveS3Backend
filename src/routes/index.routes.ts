import { routeList } from "./storage.routes.js";
import { validator } from "../middlewares/validator.js";
import { Router } from "express";
import { json } from "express";
import { authRouteList } from "./auth.routes.js";
import { authCheck } from "../middlewares/auth.js";

const router = Router();

routeList.forEach((route) => {
  const middlewares = [];

  route.method === "post" ? middlewares.push(json()) : null;

  route.schemaConfig
    ? middlewares.push(
        validator(route.schemaConfig.schemaType, route.schemaConfig.schema),
      )
    : null;

  route.authRequired ? middlewares.push(authCheck) : null;
  return router[route.method](route.route, ...middlewares, route.handler);
});

authRouteList.forEach((route) => {
  const middlewares = [];

  middlewares.push(json());

  route.schemaConfig
    ? middlewares.push(
        validator(route.schemaConfig.schemaType, route.schemaConfig.schema),
      )
    : null;

  return router[route.method](route.route, ...middlewares, route.handler);
});

export default router;
