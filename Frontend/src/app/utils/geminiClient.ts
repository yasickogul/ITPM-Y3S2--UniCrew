/** Models tried in order (AI Studio / API key compatible). */
const GEMINI_MODELS = [ 'models/gemini-1.5-flash'];

function buildPrompt(params: {
  currentDescription: string;
  userPrompt: string;
  universityName?: string;
}) {
  const instructions = `You help write concise, professional university profile descriptions for a campus platform.
Return ONLY the improved description text (plain text, no markdown code fences, no wrapping the entire answer in quotes).
Keep it under 800 words unless the user asks otherwise.`;

  const context = `University name: ${params.universityName || '(not specified)'}

Current description draft:
"""
${params.currentDescription || '(empty)'}
"""

User instruction:
${params.userPrompt}`;

  // Single user turn only — avoids v1/v1beta schema issues with top-level systemInstruction (e.g. "fullPrompt" validation errors).
  return `${instructions}\n\n---\n\n${context}`;
}

export async function enhanceUniversityDescription(params: {
  currentDescription: string;
  userPrompt: string;
  universityName?: string;
}): Promise<string> {
  const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined)?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to Frontend/.env and restart Vite.');
  }

  const textPayload = buildPrompt(params);

  const body = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: textPayload }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  let lastError = 'Gemini request failed';

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      lastError = data?.error?.message || data?.error?.status || response.statusText || lastError;
      continue;
    }

    const blockReason = data?.promptFeedback?.blockReason;
    if (blockReason) {
      lastError = `Request blocked (${blockReason}). Try a different prompt.`;
      continue;
    }

    const candidate = data?.candidates?.[0];
    const finishReason = candidate?.finishReason;
    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      lastError = `Generation stopped (${finishReason}). Try shortening the description or prompt.`;
      continue;
    }

    const text =
      candidate?.content?.parts?.map((p: { text?: string }) => p.text).filter(Boolean).join('')?.trim() || '';

    if (!text) {
      lastError = 'No text returned from Gemini. Check the API key and model access.';
      continue;
    }

    return text.slice(0, 5000);
  }

  throw new Error(lastError);
}
