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

console.log("Found generateContent models:", genModels.length);

for (const model of genModels) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Chào bạn" }] }]
      })
    });
    console.log(`Model [${model}]: status ${response.status}`);
    if (response.ok) {
      const resData = await response.json();
      console.log(`✅ SUCCESS WITH [${model}]:`, resData.candidates?.[0]?.content?.parts?.[0]?.text);
      break;
    } else {
      const errData = await response.json();
      console.log(`❌ ERROR for [${model}]:`, errData.error?.message?.slice(0, 120));
    }
  } catch (err) {
    console.error(`Fetch err for ${model}:`, err.message);
  }
}
