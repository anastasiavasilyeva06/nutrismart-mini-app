import { GoogleGenerativeAI } from "@google/generative-ai";
import { mustGetEnv } from "../_lib/env";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const apiKey = mustGetEnv("GEMINI_API_KEY");
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "Say hello in Russian in one sentence.";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);

  res.status(200).json({ ok: true, prompt, text: result.response.text() });
}

