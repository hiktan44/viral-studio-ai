import { NextRequest, NextResponse } from 'next/server';
import { generateTopazUpscale, type TopazUpscaleParams } from '@/lib/kie/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateTopazUpscale(body as TopazUpscaleParams);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upscale failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
