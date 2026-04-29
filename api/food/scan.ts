import { GoogleGenerativeAI } from "@google/generative-ai";
import { mustGetEnv } from "../_lib/env";
import { parseMultipart } from "../_lib/body";

function safeJsonExtract(text: string) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Invalid response format from Gemini");
  return JSON.parse(m[0]);
}

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { files } = await parseMultipart(req, 10 * 1024 * 1024);
    const file = files.image;
    if (!file) {
      res.status(400).json({ error: "No image uploaded (field name: image)" });
      return;
    }

    const apiKey = mustGetEnv("GEMINI_API_KEY");
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_VISION_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-flash-latest";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Analyze this food image and provide detailed nutrition information.
Respond ONLY with a valid JSON object:
{
  "name": "Food name in English",
  "calories": number_per_100g,
  "protein": number_grams_per_100g,
  "carbs": number_grams_per_100g,
  "fat": number_grams_per_100g,
  "fiber": number_grams_per_100g,
  "sugar": number_grams_per_100g,
  "healthScore": number_1_to_10,
  "aiSuggestions": "Brief health advice about this food",
  "alternatives": ["healthier alternative 1", "healthier alternative 2", "healthier alternative 3"],
  "portionSize": estimated_typical_portion_in_grams,
  "confidence": decimal_0_to_1
}
If unsure, return best estimates.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: file.buffer.toString("base64"),
          mimeType: file.mimeType || "image/jpeg"
        }
      }
    ]);

    const text = result.response.text();
    const parsed = safeJsonExtract(text);

    res.status(200).json({
      ...parsed,
      fiber: Number(parsed.fiber ?? 0),
      sugar: Number(parsed.sugar ?? 0),
      confidence: Number(parsed.confidence ?? 0.6),
      alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Failed to analyze food image" });
  }
}

