import { NextRequest, NextResponse } from 'next/server';
import { generateSunoMusic, type SunoParams } from '@/lib/kie/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateSunoMusic(body as SunoParams);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Music generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
