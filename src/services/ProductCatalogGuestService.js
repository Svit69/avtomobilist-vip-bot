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
    const positions = items.map((item, i) => `${i + 1}. ${this.#formatter.formatBold(item.title)}\n${item.description}\nЦена: ${this.#formatter.formatBold(`от ${new Intl.NumberFormat('ru-RU').format(item.priceFrom)} ₽`)}\nОсталось наборов: ${this.#formatter.formatBold(`${item.quantity} шт`)}`);
    const donationText = `${items.length + 1}. Не хочу ничего покупать, хочу просто пожертвовать деньги на благотворительность, <a href="https://help-children.net/campaign/obnovlenie-tehnologicheskoj-bazy-laboratorii-tsentra-detskoj-onkologii-i-gematologii-odkb-sleduyushhij-etap/">перейти на сайт фонда</a>.`;
    const notice = '<i>* количество наборов ограничено</i>';
    const customOrderText = 'Для индивидуального заказа отдельных товаров у нас работает точка продаж на первом этаже в секторе А.';
    const text = [notice, ...positions, donationText, customOrderText].join('\n\n');
    const photos = items.flatMap(item => item.photos || []);
    const buttons = items.map(item => [{ text: `${item.title}: добавить в корзину`, callback_data: `add_to_cart:${item.id}` }]);
    return { text, photos, buttons };
  }
}

module.exports = ProductCatalogGuestService;
