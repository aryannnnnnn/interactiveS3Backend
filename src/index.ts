import { config } from "dotenv";
config({ quiet: false });
import express from "express";
import routes from "./routes/index.routes.js";
import * as crypto from "crypto";

const app = express();
crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_SECRET_TOKEN!)
  .digest();

app.router.use(routes);

app.listen(8000, () => {
  console.log("server running on port 8000");
});
