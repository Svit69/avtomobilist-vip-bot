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
    const cards = items.map(item => ({
      photos: item.photos || [],
      caption: `${this.#formatter.formatBold(item.title)}\n${item.description}\nЦена: ${this.#formatter.formatBold(`от ${item.priceFrom} ₽`)}`
    }));
    return { cards };
  }
}

module.exports = ProductCatalogGuestService;
