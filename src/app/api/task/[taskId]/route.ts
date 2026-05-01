import { NextRequest, NextResponse } from 'next/server';
import {
  getGptImageStatus,
  getFluxImageStatus,
  getRunwayStatus,
  getVeo3Status,
  getSunoStatus,
  getMarketTaskStatus,
  type TaskResult,
} from '@/lib/kie/client';

const statusCheckers: Record<string, (taskId: string) => Promise<TaskResult>> = {
  'gpt-image': getGptImageStatus,
  'flux': getFluxImageStatus,
  'runway': getRunwayStatus,
  'veo3': getVeo3Status,
  'suno': getSunoStatus,
  'market': getMarketTaskStatus,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const type = req.nextUrl.searchParams.get('type') || 'market';
    const checker = statusCheckers[type] || getMarketTaskStatus;
    const result = await checker(taskId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Status check failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
