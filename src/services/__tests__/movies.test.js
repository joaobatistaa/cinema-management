import * as movies from "../movies";

describe("movies service", () => {
  it("getMovies returns an array", async () => {
    const ms = await movies.getMovies();
    expect(Array.isArray(ms)).toBe(true);
  });

  it("addMovie adds a movie", async () => {
    const m = await movies.addMovie({ title: "Test Movie", image: "" });
    expect(m).toHaveProperty("id");
    expect(m.title).toBe("Test Movie");
    // Clean up
    await movies.removeMovie(m.id);
  });

  it("updateMovie updates a movie", async () => {
    const m = await movies.addMovie({ title: "ToUpdate", image: "" });
    const updated = await movies.updateMovie(m.id, { title: "Updated Movie" });
    expect(updated.title).toBe("Updated Movie");
    // Clean up
    await movies.removeMovie(m.id);
  });

  it("removeMovie removes a movie", async () => {
    const m = await movies.addMovie({ title: "ToDelete", image: "" });
    await movies.removeMovie(m.id);
    const ms = await movies.getMovies();
    expect(ms.find((x) => x.id === m.id)).toBeUndefined();
  });
});
