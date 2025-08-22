import openai from "../config/openai.js";
import { junoPrompt } from "../constants/prompts.js";

export async function getChatReply(message) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: junoPrompt },
      { role: "user", content: message },
    ],
  });

  return (
    response.choices[0]?.message?.content ||
    "Sorry, I couldn't generate a response."
  );
}
