import { NextRequest, NextResponse } from 'next/server';
import {
  generateSeedanceVideo,
  generateKlingVideo,
  generateRunwayVideo,
  generateVeo3Video,
  type SeedanceParams,
  type KlingImageToVideoParams,
  type RunwayParams,
  type Veo3Params,
} from '@/lib/kie/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, ...params } = body;

    let result;

    switch (provider) {
      case 'seedance':
        result = await generateSeedanceVideo(params as SeedanceParams);
        break;
      case 'kling':
        result = await generateKlingVideo(params as KlingImageToVideoParams);
        break;
      case 'runway':
        result = await generateRunwayVideo(params as RunwayParams);
        break;
      case 'veo3':
        result = await generateVeo3Video(params as Veo3Params);
        break;
      default:
        result = await generateSeedanceVideo(params as SeedanceParams);
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Video generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
