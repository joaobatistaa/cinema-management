import * as tickets from "../tickets";

describe("tickets service", () => {
  it("getTickets returns an array", () => {
    const ts = tickets.getTickets();
    expect(Array.isArray(ts)).toBe(true);
  });

  it("addTicket adds a ticket", () => {
    const t = tickets.addTicket({
      movie_id: 1,
      session_id: 1,
      room_id: 1,
      seat: { row: 1, col: 1 },
      datetime: "2025-01-01T10:00:00",
      bar_items: [],
      ticket_price: 7,
      bar_total: 0,
      buy_total: 7
    });
    expect(t).toHaveProperty("id");
    expect(t.movie_id).toBe(1);
    // Clean up
    const all = tickets.getTickets();
    const idx = all.findIndex((x) => x.id === t.id);
    all.splice(idx, 1);
    tickets.writeTickets(all);
  });

  it("filterTickets filters by id", () => {
    const t = tickets.addTicket({
      movie_id: 1,
      session_id: 1,
      room_id: 1,
      seat: { row: 1, col: 1 },
      datetime: "2025-01-01T10:00:00",
      bar_items: [],
      ticket_price: 7,
      bar_total: 0,
      buy_total: 7
    });
    const filtered = tickets.filterTickets({ id: t.id });
    expect(filtered.length).toBeGreaterThan(0);
    // Clean up
    const all = tickets.getTickets();
    const idx = all.findIndex((x) => x.id === t.id);
    all.splice(idx, 1);
    tickets.writeTickets(all);
  });
});
