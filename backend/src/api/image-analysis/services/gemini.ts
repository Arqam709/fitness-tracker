import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function extractJson(text: string) {
  // Remove ```json fences if present
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: extract first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini response did not contain JSON.");
    return JSON.parse(match[0]);
  }
}

export const analyzeImage = async (filePath: string, mimeType?: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const base64ImageFile = fs.readFileSync(filePath, { encoding: "base64" });

  const contents: any = [
    {
      inlineData: {
        mimeType: mimeType || "image/jpeg", // ✅ dynamic if provided
        data: base64ImageFile,
      },
    },
    {
      text: `
Return ONLY a JSON object with this shape:
{
  "name": "string",
  "calories": number
}
No extra text, no markdown.
`,
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    // ✅ keep it simple; schema config differs across SDK versions
    config: { responseMimeType: "application/json" },
  });

  const text = response?.text ?? "";
  const parsed = extractJson(text);

  // ✅ validate output
  if (!parsed?.name || parsed?.calories == null) {
    throw new Error(`Gemini returned invalid JSON: ${text}`);
  }

  return {
    name: String(parsed.name),
    calories: Number(parsed.calories),
  };
};
