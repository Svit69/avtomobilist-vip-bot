class ProductCatalogRepository {
  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  getAllProducts() {
    return this.#repository.readAll();
  }

  addProduct(product) {
    const items = this.#repository.readAll();
    const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const nextProduct = { id: nextId, ...product };
    items.push(nextProduct);
    this.#repository.writeAll(items);
    return nextProduct;
  }

  deleteProductById(id) {
    const items = this.#repository.readAll();
    const next = items.filter(item => item.id !== id);
    this.#repository.writeAll(next);
    return items.length !== next.length;
  }

  updateProductById(id, payload) {
    const items = this.#repository.readAll();
    const index = items.findIndex(item => item.id === id);
    if (index < 0) return null;
    items[index] = { ...items[index], ...payload, id };
    this.#repository.writeAll(items);
    return items[index];
  }
}

module.exports = ProductCatalogRepository;
