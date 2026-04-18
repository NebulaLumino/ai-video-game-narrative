import { NextRequest, NextResponse } from 'next/server';
let _clientPromise: Promise<any> | null = null;

async function getClient() {
  if (!_clientPromise) {
    _clientPromise = (async () => {
      const { default: OpenAI } = await import('openai');
      return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.deepseek.com/v1'
      });
    })();
  }
  return _clientPromise;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const f1: string = body.f1 || '';
    const f2: string = body.f2 || '';
    const f3: string = body.f3 || '';
    const f4: string = body.f4 || '';
    const userContent = `Game Genre: ${f1}\nSetting: ${f2}\nTarget Esrb: ${f3}\nTheme: ${f4}`;
    const client = await getClient();
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are an expert game writer and narrative designer. Given game genre, setting, target ESRB rating, and theme, generate a comprehensive video game narrative design including: story synopsis and world-building, main character arcs and motivations, key plot beats and narrative structure, antagonist design and conflict, setting and environment details, themes and moral questions explored, gameplay-narrative integration points, and how the ESRB rating shapes content decisions. Format with clear sections.' },
        { role: 'user', content: userContent },
      ]
    });
    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}