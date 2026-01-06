const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 테스트용 API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is alive",
  });
});

app.post("/api/echo", (req, res) => {
  res.json({
    received: req.body,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
