import { NextRequest, NextResponse } from 'next/server';
import { generateTTS, type ElevenLabsTTSParams } from '@/lib/kie/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateTTS(body as ElevenLabsTTSParams);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TTS generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
