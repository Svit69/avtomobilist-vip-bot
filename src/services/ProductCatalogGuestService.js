class ProductCatalogGuestService {
  #repository;
  #formatter;

  constructor(repository, formatter) {
    this.#repository = repository;
    this.#formatter = formatter;
  }

  buildGuestCatalogPayload() {
    const items = this.#repository.getAllProducts();
    if (!items.length) return { emptyMessage: 'Сейчас товаров нет. Скоро добавим карточки мерча.' };
    const text = items.map((item, i) => `${i + 1}. ${this.#formatter.formatBold(item.title)}\nЦена: ${this.#formatter.formatBold(`от ${item.priceFrom} ₽`)}`).join('\n\n');
    const photos = items.flatMap(item => item.photos || []);
    const buttons = items.map(item => [{ text: `${item.title}: добавить в корзину`, callback_data: `add_to_cart:${item.id}` }]);
    return { text, photos, buttons };
  }
}

module.exports = ProductCatalogGuestService;
