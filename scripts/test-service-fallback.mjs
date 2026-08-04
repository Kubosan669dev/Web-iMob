import { readFileSync } from "fs";

// Simulate Vite environment variable by setting process.env
const envContent = readFileSync(".env", "utf8");
const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const key = match ? match[1].trim() : "";

// Directly test fetch with gemini-flash-latest
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [
      { role: "user", parts: [{ text: "Bạn có biết làm ứng dụng Zalo cho ngành thời trang bán quần áo không?" }] }
    ]
  })
});

console.log("Status:", res.status);
if (res.ok) {
  const data = await res.json();
  console.log("SUCCESS RESPONSE:\n", data.candidates?.[0]?.content?.parts?.[0]?.text);
} else {
  console.log("Error:", await res.text());
}
