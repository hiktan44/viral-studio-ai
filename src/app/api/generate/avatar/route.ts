import { NextRequest, NextResponse } from 'next/server';
import { generateKlingAvatar, generateInfinitalk, type KlingAvatarParams, type InfinitalkParams } from '@/lib/kie/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...params } = body;

    let result;

    if (type === 'lip-sync') {
      result = await generateInfinitalk(params as InfinitalkParams);
    } else {
      result = await generateKlingAvatar(params as KlingAvatarParams);
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Avatar generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
