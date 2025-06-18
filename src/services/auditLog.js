import fs from 'fs/promises';
import path from 'path';

const auditLogPath = path.join(process.cwd(), 'src', 'data', 'auditLog.json');

export async function getAuditLogs() {
  try {
    const data = await fs.readFile(auditLogPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT')  return [];
    throw err;
  }
}

export async function addAuditLog({ userID, userName, description, date }) {
  const logs = await getAuditLogs();
  const id = logs.length > 0 ? Math.max(...logs.map(log => log.id)) + 1 : 1;
  const entry = { 
    id,
    userID,
    userName,
    date: date || new Date().toISOString(),
    description
  };
  logs.push(entry);
  await fs.writeFile(auditLogPath, JSON.stringify(logs, null, 2));
  return entry;
}
