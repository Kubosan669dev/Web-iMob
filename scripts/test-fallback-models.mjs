import { readFileSync } from "fs";

const envContent = readFileSync(".env", "utf8");
const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const key = match ? match[1].trim() : "";

const models = [
  "gemma-4-26b-a4b-it",
  "gemma-3-27b-it",
  "gemma-3-12b-it",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash"
];

for (const model of models) {
  console.log(`Testing model: ${model}...`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hãy giới thiệu về bản thân bạn trong 1 câu." }] }]
      })
    });
    console.log(`Status for ${model}:`, res.status);
    if (res.ok) {
      const data = await res.json();
      console.log(`SUCCESS! [${model}] Answer:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
      break;
    }
  } catch (err) {
    console.error(`Error for ${model}:`, err);
  }
}
