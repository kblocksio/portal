import express, { Express } from "express";
import { config } from "dotenv";
import cors from "cors";
import { K8sRequestParams } from "@repo/shared";
import { kubernetesRequest } from "./k8s";

config();

const port = process.env.PORT || 3001;
const app: Express = express();
app.use(express.json());
app.use(
  "*",
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

const createRoutes = () => {
  app.get("/api", async (req, res) => {
    const params = req.query as unknown as K8sRequestParams;

    const url = [];

    if (params.group === "core") {
      url.push("api");
    } else {
      url.push("apis");
      url.push(params.group);
    }

    url.push(params.version);
    url.push(params.plural);

    const result = await kubernetesRequest(url.join("/"));
    const data = await result.json();
    return res.status(200).json(data);
  });
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

createRoutes();
