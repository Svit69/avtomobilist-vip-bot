class ProductCatalogAdminService {
  #repository;

  constructor(repository) { this.#repository = repository; }

  listProductsText() {
    const items = this.#repository.getAllProducts();
    if (!items.length) return 'Каталог пуст.';
    return items.map(item => `${item.id}. ${item.title} | от ${item.priceFrom} ₽ | остаток: ${item.quantity}`).join('\n');
  }

  buildQuantityButtons() {
    return this.#repository.getAllProducts().map(item => [{ text: `#${item.id} ${item.title} (${item.quantity} шт)`, callback_data: `admin_qty_select:${item.id}` }]);
  }

  addProduct(input) { return this.#repository.addProduct(input); }
  editProduct(id, input) { return this.#repository.updateProductById(id, input); }
  removeProduct(id) { return this.#repository.deleteProductById(id); }
  setProductQuantity(id, quantity) { return this.#repository.setQuantityById(id, quantity); }
}

module.exports = ProductCatalogAdminService;
