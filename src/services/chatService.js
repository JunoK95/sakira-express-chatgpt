import openai from "../config/openai.js";
import { knowledgeBase } from "../constants/prompts.js";

export async function getChatReply(message) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: knowledgeBase },
      { role: "user", content: message },
    ],
  });

  return (
    response.choices[0]?.message?.content ||
    "Sorry, I couldn't generate a response."
  );
}
