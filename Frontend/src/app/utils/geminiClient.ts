const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

export async function enhanceUniversityDescription(params: {
  currentDescription: string;
  userPrompt: string;
  universityName?: string;
}): Promise<string> {
  const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined)?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to Frontend/.env and restart Vite.');
  }

  const systemInstruction = `You help write concise, professional university profile descriptions for a campus platform.
Return ONLY the improved description text (plain text, no markdown fences, no quotes wrapping the whole answer).
Keep it under 800 words unless the user asks otherwise.`;

  const userText = `University name: ${params.universityName || '(not specified)'}

Current description draft:
"""
${params.currentDescription || '(empty)'}
"""

User instruction:
${params.userPrompt}`;

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text: userText }] }],
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
      lastError = data?.error?.message || response.statusText || lastError;
      continue;
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('')?.trim() ||
      '';

    if (!text) {
      lastError = 'No text returned from Gemini';
      continue;
    }

    return text.slice(0, 5000);
  }

  throw new Error(lastError);
}
