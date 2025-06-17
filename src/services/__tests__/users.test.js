import * as users from "../users";

describe("users service", () => {
  it("getUsers returns an array", async () => {
    const us = await users.getUsers();
    expect(Array.isArray(us)).toBe(true);
  });

  it("addUser adds a user and getUserByEmail finds it", async () => {
    const email = `test${Date.now()}@test.com`;
    const user = await users.addUser({
      email,
      password: "123456",
      name: "Test User"
    });
    expect(user).toHaveProperty("id");
    const found = await users.getUserByEmail(email);
    expect(found).not.toBeNull();
    // Clean up: mark as inactive (or remove manually if needed)
  });

  it("authenticateUser authenticates a user", async () => {
    const email = `test${Date.now()}@test.com`;
    await users.addUser({
      email,
      password: "123456",
      name: "Test User"
    });
    const auth = await users.authenticateUser(email, "123456");
    expect(auth.email).toBe(email);
  });
});
