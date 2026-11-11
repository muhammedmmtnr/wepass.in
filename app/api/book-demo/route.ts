import { NextRequest } from 'next/server';
import { submitLead } from '../leads/handler';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return submitLead(req);
}
