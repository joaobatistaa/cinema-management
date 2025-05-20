import fs from "fs";
import path from "path";

const sessionsFilePath = path.join(__dirname, "sessions.json");

// Helper function to read sessions from the JSON file
function readSessions() {
  console.log(fs.existsSync(sessionsFilePath));

  if (!fs.existsSync(sessionsFilePath)) {
    fs.writeFileSync(sessionsFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(sessionsFilePath, "utf-8");
  return JSON.parse(data);
}

// Helper function to write sessions to the JSON file
function writeSessions(sessions) {
  fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));
}

// Get all sessions
export function getSessions() {
  return readSessions();
}

// Add a new session
export function addSession(session) {
  const sessions = readSessions();
  sessions.push(session);
  writeSessions(sessions);
}

// Delete a session by ID
export function deleteSession(sessionId) {
  let sessions = readSessions();
  sessions = sessions.filter((session) => session.id !== sessionId);
  writeSessions(sessions);
}

// Update a session by ID
export function updateSession(sessionId, updatedSession) {
  const sessions = readSessions();
  const sessionIndex = sessions.findIndex(
    (session) => session.id === sessionId
  );
  if (sessionIndex !== -1) {
    sessions[sessionIndex] = { ...sessions[sessionIndex], ...updatedSession };
    writeSessions(sessions);
  }
}
