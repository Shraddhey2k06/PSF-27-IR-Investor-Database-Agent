/*
  OPTIONAL PRODUCTION BACKEND CONTRACT
  ------------------------------------
  This example shows the API shape expected by the GitHub Pages frontend.

  IMPORTANT:
  - Keep all secret API keys on the server.
  - Use only permitted/public professional sources and APIs.
  - Do not automate scraping of restricted platforms.
  - Replace the TODO research implementation with your approved web-research provider.
*/

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/research", async (req, res) => {
  const { sourceUrl } = req.body;

  if (!sourceUrl) {
    return res.status(400).json({ error: "sourceUrl is required" });
  }

  /*
    TODO:
      1. Retrieve/import investor names from the supplied directory using
         a permitted method.
      2. Research each investor using approved public/professional sources.
      3. Resolve identity using name + firm + role + city.
      4. Return evidence URLs.
      5. Never invent missing fields.
      6. Mark uncertain records as "review".
  */

  const investors = [];

  return res.json({
    sourceUrl,
    investors
  });
});

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 8787, () => {
  console.log("PSF research backend running");
});
