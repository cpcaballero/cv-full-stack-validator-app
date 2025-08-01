const express = require("express");
const pdfParse = require("pdf-parse");
const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/validate", async (req, res) => {
  const { fullName, email, phone, skills, experience, pdfBase64 } = req.body;
  const buffer = Buffer.from(pdfBase64, "base64");
  const { text } = await pdfParse(buffer);

  const mismatches = [];
  if (!text.toLowerCase().includes(fullName.toLowerCase()))
    mismatches.push("fullName");
  if (!text.toLowerCase().includes(email.toLowerCase()))
    mismatches.push("email");
  if (!text.toLowerCase().includes(phone)) mismatches.push("phone");
  if (!text.toLowerCase().includes(skills.toLowerCase()))
    mismatches.push("skills");
  if (!text.toLowerCase().includes(experience.toLowerCase()))
    mismatches.push("experience");

  res.json({ success: mismatches.length === 0, mismatches });
});

app.listen(3001, () => console.log("AI Validator running on port 3001"));
