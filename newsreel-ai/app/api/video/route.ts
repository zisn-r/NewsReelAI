import { NextRequest, NextResponse } from 'next/server';
import { getTaskStatus } from '@/lib/runway';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
  }

  try {
    const status = await getTaskStatus(taskId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('[Video Poll] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
