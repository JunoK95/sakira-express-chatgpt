import express from "express";
import cors from "cors";
import "./config/dotenv.js";
import chatRoutes from "./routes/chatRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/", healthRoutes);
app.use("/chat", chatRoutes);
app.use("/record", recordRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
