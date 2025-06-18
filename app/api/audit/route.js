import { getAuditLogs, addAuditLog } from '@/src/services/auditLog';

export async function GET(req) {
  const logs = await getAuditLogs();
  return new Response(JSON.stringify(logs), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req) {
  try {
    const { userID, description, date } = await req.json();
    if (!userID || !description) {
      return new Response(JSON.stringify({ error: 'userID and description are required' }), { status: 400 });
    }
    const entry = await addAuditLog({ userID, description, date });
    return new Response(JSON.stringify(entry), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export function handler(req) {
  return new Response('Method Not Allowed', { status: 405 });
}

export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
