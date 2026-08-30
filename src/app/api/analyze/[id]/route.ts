import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/db/analysis';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Missing analysis ID' }, { status: 400 });
    }

    const analysis = await getAnalysisById(id);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis record not found' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve analysis';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
