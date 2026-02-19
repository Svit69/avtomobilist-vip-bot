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
    const positions = items.map((item, i) => `${i + 1}. ${this.#formatter.formatBold(item.title)}\nЦена: ${this.#formatter.formatBold(`от ${item.priceFrom} ₽`)}`);
    const donationText = `${items.length + 1}. Не хочу ничего покупать, хочу просто пожертвовать деньги на благотворительность.`;
    const text = [...positions, donationText].join('\n\n');
    const photos = items.flatMap(item => item.photos || []);
    const cartButtons = items.map(item => [{ text: `${item.title}: добавить в корзину`, callback_data: `add_to_cart:${item.id}` }]);
    const donationButton = [{ text: 'перейти на сайт фонда', url: 'https://help-children.net/campaign/obnovlenie-tehnologicheskoj-bazy-laboratorii-tsentra-detskoj-onkologii-i-gematologii-odkb-sleduyushhij-etap/' }];
    return { text, photos, buttons: [...cartButtons, donationButton] };
  }
}

module.exports = ProductCatalogGuestService;
