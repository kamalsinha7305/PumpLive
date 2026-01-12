import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bitqueryRoutes from "./routes/bitquery.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Backend running ✅" });
});

app.use("/api/bitquery", bitqueryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
