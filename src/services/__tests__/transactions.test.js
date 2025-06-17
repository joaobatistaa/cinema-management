import * as transactions from "../transactions";

describe("transactions service", () => {
  it("getTransactions returns an array", () => {
    const ts = transactions.getTransactions();
    expect(Array.isArray(ts)).toBe(true);
  });

  it("addTransaction adds a transaction", async () => {
    const before = transactions.getTransactions().length;
    await transactions.addTransaction({ amount: 10, type: "test" });
    const after = transactions.getTransactions().length;
    expect(after).toBeGreaterThan(before);
  });
});
