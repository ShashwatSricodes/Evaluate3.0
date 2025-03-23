require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const evaluationRoutes = require("./routes/EvaluationRoute.js");
const MarksRoutes = require("./routes/MarksRoute.js");

const app = express();


app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.listen(5000, () => console.log("Server running on port 5000"));

app.use("/api/evaluations", evaluationRoutes);
app.use("/api/data", MarksRoutes);


