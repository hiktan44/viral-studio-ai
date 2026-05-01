import { NextRequest, NextResponse } from 'next/server';
import { generateGptImage, generateFluxImage, type GptImageParams, type FluxParams } from '@/lib/kie/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, ...params } = body;

    let result;

    if (provider === 'flux') {
      result = await generateFluxImage(params as FluxParams);
    } else {
      // Default to gpt-4o image
      result = await generateGptImage(params as GptImageParams);
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
