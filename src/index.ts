import { config } from "dotenv";
config({ quiet: false });
import express from "express";
import routes from "./routes/index.routes.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.router.use(routes);

app.listen(8000, () => {
  console.log("server running on port 8000");
});
