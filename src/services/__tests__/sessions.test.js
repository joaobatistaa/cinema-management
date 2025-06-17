import * as sessions from "../sessions";

describe("sessions service", () => {
  it("getSessions returns an array", async () => {
    const ss = await sessions.getSessions();
    expect(Array.isArray(ss)).toBe(true);
  });

  it("addSession adds a session", async () => {
    const s = await sessions.addSession({
      movieId: 1,
      room: 1,
      date: "2025-01-01T10:00:00",
      language: "PT"
    });
    expect(s).toHaveProperty("id");
    expect(s.movieId).toBe(1);
    // Clean up
    await sessions.removeSession(s.id);
  });

  it("updateSession updates a session", async () => {
    const s = await sessions.addSession({
      movieId: 1,
      room: 1,
      date: "2025-01-01T10:00:00",
      language: "PT"
    });
    const updated = await sessions.updateSession(s.id, { language: "EN" });
    expect(updated.language).toBe("EN");
    // Clean up
    await sessions.removeSession(s.id);
  });

  it("removeSession removes a session", async () => {
    const s = await sessions.addSession({
      movieId: 1,
      room: 1,
      date: "2025-01-01T10:00:00",
      language: "PT"
    });
    await sessions.removeSession(s.id);
    const ss = await sessions.getSessions();
    expect(ss.find((x) => x.id === s.id)).toBeUndefined();
  });
});
