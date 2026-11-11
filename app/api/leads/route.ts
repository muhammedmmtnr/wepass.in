import { NextRequest } from 'next/server';
import { submitLead } from './handler';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return submitLead(req);
}
