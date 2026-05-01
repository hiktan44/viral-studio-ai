import { NextRequest, NextResponse } from 'next/server';
import { agentChat } from '@/lib/kie/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, context } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const response = await agentChat(prompt, context);
    return NextResponse.json({ success: true, response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Agent chat failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
