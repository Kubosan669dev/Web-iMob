import { readFileSync } from "fs";

const envContent = readFileSync(".env", "utf8");
const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const key = match ? match[1].trim() : "";

console.log("Testing API Key:", key);

// Try listing models first
const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
try {
  const res = await fetch(listUrl);
  console.log("List Models Status:", res.status);
  const data = await res.json();
  console.log("List Models Response:", JSON.stringify(data, null, 2));
} catch (err) {
  console.error("List Models error:", err);
}

// Try gemini-2.0-flash
const testModels = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash-lite"];
for (const m of testModels) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hello" }] }]
      })
    });
    console.log(`Model ${m} Status:`, res.status);
    if (res.ok) {
      const data = await res.json();
      console.log(`SUCCESS for ${m}! Result:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
      break;
    }
  } catch (e) {
    console.error(`Error testing ${m}:`, e);
  }
}
