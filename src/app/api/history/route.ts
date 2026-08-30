import { NextRequest, NextResponse } from 'next/server';
import { clearAllAnalysisRecords, deleteAnalysisRecord, listAnalyses } from '@/lib/db/analysis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verdict = searchParams.get('verdict') || undefined;
    const inputType = searchParams.get('inputType') || undefined;
    const searchQuery = searchParams.get('searchQuery') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await listAnalyses({
      verdict,
      inputType,
      searchQuery,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve analysis history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (action === 'clearAll') {
      await clearAllAnalysisRecords();
      return NextResponse.json({ success: true, message: 'All analysis history cleared.' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing record ID for deletion' }, { status: 400 });
    }

    const success = await deleteAnalysisRecord(id);
    return NextResponse.json({ success, message: 'Record deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
