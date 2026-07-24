import Anthropic from '@anthropic-ai/sdk';

// 한국어 텍스트 → 자연스러운 일본어 번역 (폼 필드별 "번역" 버튼에서 여러 모듈이 공통으로 사용)
export async function translateKoToJa(text: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `다음 한국어 텍스트를 자연스러운 일본어로 번역해주세요. 번역 결과만 출력하고 다른 설명은 추가하지 마세요. 번역 불가능한 경우 원본문장을 출력해주세요. \n\n${text}`,
      },
    ],
  });

  return response.content[0].type === 'text'
    ? response.content[0].text.trim()
    : '';
}
