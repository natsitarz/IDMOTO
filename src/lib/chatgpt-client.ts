export async function askChatGPT(question: string, userInfo?: string, systemPrompt?: string) {
  const res = await fetch("/api/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, userInfo, systemPrompt }),
  });
  if (!res.ok) throw new Error("OpenAI error");
  const data = await res.json();
  return data.answer;
}