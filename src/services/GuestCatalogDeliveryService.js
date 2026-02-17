class GuestCatalogDeliveryService {
  #guestCatalogService;

  constructor(guestCatalogService) {
    this.#guestCatalogService = guestCatalogService;
  }

  async sendCatalog(bot, chatId) {
    const payload = this.#guestCatalogService.buildGuestCatalogPayload();
    if (payload.emptyMessage) return bot.sendMessage(chatId, payload.emptyMessage, { parse_mode: 'HTML' });
    for (const card of payload.cards) await this.#sendCard(bot, chatId, card);
  }

  async #sendCard(bot, chatId, card) {
    const button = { inline_keyboard: [[{ text: 'Заказать', callback_data: `add_to_cart:${card.productId}` }]] };
    if (!card.photos.length) return bot.sendMessage(chatId, card.caption, { parse_mode: 'HTML', reply_markup: button });
    if (card.photos.length === 1) return bot.sendPhoto(chatId, card.photos[0], { caption: card.caption, parse_mode: 'HTML', reply_markup: button });
    const media = card.photos.map((photo, index) => (index ? { type: 'photo', media: photo } : { type: 'photo', media: photo, caption: card.caption, parse_mode: 'HTML' }));
    await bot.sendMediaGroup(chatId, media);
    await bot.sendMessage(chatId, 'Добавить товар в корзину:', { reply_markup: button });
  }
}

module.exports = GuestCatalogDeliveryService;
