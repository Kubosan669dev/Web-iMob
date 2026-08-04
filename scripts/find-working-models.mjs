import { readFileSync } from "fs";

const envContent = readFileSync(".env", "utf8");
const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const key = match ? match[1].trim() : "";

const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
const res = await fetch(listUrl);
const data = await res.json();

const genModels = (data.models || [])
  .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
  .map(m => m.name.replace("models/", ""));

const workingModels = [];

for (const model of genModels) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hello" }] }]
      })
    });
    if (response.ok) {
      workingModels.push(model);
      console.log(`✅ Model WORKS: ${model}`);
    }
  } catch (err) {
    // ignore
  }
}

console.log("All working models for this key:", workingModels);
