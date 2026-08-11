import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function getMoodSuggestion(
  recentMoods: { value: number; date: string }[],
): Promise<{ suggestion: string; isStreak: boolean }> {
  const isStreak = recentMoods.length >= 3 && recentMoods.slice(-3).every((m) => m.value <= 2);

  const prompt = isStreak
    ? `El usuario ha registrado ánimo bajo (1-2 de 5) durante los últimos 3 días o más. Genera un mensaje breve (máx 2 frases), cálido y directo, que lo anime a hablarlo con alguien de confianza o un profesional. No des tips genéricos esta vez. No uses guiones ni puntos al inicio. No finales con preguntas.`
    : `El usuario registró un ánimo bajo hoy (día aislado). Genera UNA sugerencia breve y práctica (máx 2 frases) para manejar el momento. Puede ser respirar, salir a caminar, escribirlo, hablar con alguien, escuchar música, etc. Varía la sugerencia, no siempre lo mismo. Sin diagnósticos, sin análisis del por qué. No uses guiones ni puntos al inicio.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

  return { suggestion: text, isStreak };
}
