class ProductCatalogRepository {
  #repository;

  constructor(repository) { this.#repository = repository; }

  getAllProducts() { return this.#repository.readAll().map(item => ({ ...item, quantity: Number.isInteger(item.quantity) ? item.quantity : 0 })); }
  getProductById(id) { return this.getAllProducts().find(item => item.id === id) || null; }

  addProduct(product) {
    const items = this.getAllProducts();
    const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const nextProduct = { id: nextId, ...product, quantity: Number(product.quantity) || 0 };
    this.#repository.writeAll([...items, nextProduct]);
    return nextProduct;
  }

  deleteProductById(id) {
    const items = this.getAllProducts();
    const next = items.filter(item => item.id !== id);
    this.#repository.writeAll(next);
    return items.length !== next.length;
  }

  updateProductById(id, payload) {
    const items = this.getAllProducts();
    const index = items.findIndex(item => item.id === id);
    if (index < 0) return null;
    items[index] = { ...items[index], ...payload, id };
    this.#repository.writeAll(items);
    return items[index];
  }

  setQuantityById(id, quantity) { return this.updateProductById(id, { quantity }); }

  decreaseQuantities(cartItems) {
    const items = this.getAllProducts();
    for (const cartItem of cartItems) {
      const product = items.find(item => item.id === cartItem.productId);
      if (!product) return { error: 'Товар не найден.' };
      if (product.quantity < cartItem.quantity) return { error: `Недостаточно остатка: ${product.title}.` };
    }
    for (const cartItem of cartItems) items.find(item => item.id === cartItem.productId).quantity -= cartItem.quantity;
    this.#repository.writeAll(items);
    return { ok: true };
  }
}
module.exports = ProductCatalogRepository;
