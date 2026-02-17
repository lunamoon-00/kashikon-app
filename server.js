require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティヘッダー
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// リクエストボディの制限
app.use(express.json({ limit: "10mb" }));

// APIのレート制限（1IPあたり1分間に10回まで）
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "リクエストが多すぎます。1分後に再試行してください。" },
});

app.post("/api/chat", apiLimiter, async (req, res) => {
  try {
    // 許可するモデルを制限
    const allowedModels = ["claude-sonnet-4-20250514"];
    const model = req.body.model;
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ error: "許可されていないモデルです" });
    }

    // max_tokensの上限を制限
    const maxTokens = Math.min(req.body.max_tokens || 2500, 3000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        messages: req.body.messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
