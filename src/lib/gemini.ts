import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function askGemini(question: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
  const result = await model.generateContent(question);
  const response = await result.response;
  return response.text();
}