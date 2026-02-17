class ProductCatalogAdminService {
  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  listProductsText() {
    const items = this.#repository.getAllProducts();
    if (!items.length) return 'Каталог пуст.';
    return items.map(item => `${item.id}. ${item.title} | от ${item.priceFrom} ₽ | фото: ${item.photos.length}`).join('\n');
  }

  addProduct(input) {
    return this.#repository.addProduct(input);
  }

  editProduct(id, input) {
    return this.#repository.updateProductById(id, input);
  }

  removeProduct(id) {
    return this.#repository.deleteProductById(id);
  }
}

module.exports = ProductCatalogAdminService;
