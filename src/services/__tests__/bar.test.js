import * as bar from "../bar";

describe("bar service", () => {
  it("getProducts returns an array", async () => {
    const products = await bar.getProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it("addProduct adds a product", async () => {
    const prod = await bar.addProduct({ name: "Test", stock: 10, price: 1.5 });
    expect(prod).toHaveProperty("id");
    expect(prod.name).toBe("Test");
    // Clean up
    await bar.deleteProduct(prod.id);
  });

  it("updateProduct updates a product", async () => {
    const prod = await bar.addProduct({ name: "ToUpdate", stock: 5, price: 2 });
    const updated = await bar.updateProduct({
      id: prod.id,
      name: "Updated",
      stock: 3,
      price: 2.5
    });
    expect(updated).toBe(true);
    const products = await bar.getProducts();
    const found = products.find((p) => p.id === prod.id);
    expect(found.name).toBe("Updated");
    // Clean up
    await bar.deleteProduct(prod.id);
  });

  it("deleteProduct removes a product", async () => {
    const prod = await bar.addProduct({ name: "ToDelete", stock: 1, price: 1 });
    const deleted = await bar.deleteProduct(prod.id);
    expect(deleted).toBe(true);
    const products = await bar.getProducts();
    expect(products.find((p) => p.id === prod.id)).toBeUndefined();
  });
});
