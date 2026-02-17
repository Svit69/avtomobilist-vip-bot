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
    if (!card.photos.length) return bot.sendMessage(chatId, card.caption, { parse_mode: 'HTML' });
    if (card.photos.length === 1) {
      return bot.sendPhoto(chatId, card.photos[0], { caption: card.caption, parse_mode: 'HTML' });
    }
    const media = card.photos.map((photo, index) => (index ? { type: 'photo', media: photo } : { type: 'photo', media: photo, caption: card.caption, parse_mode: 'HTML' }));
    return bot.sendMediaGroup(chatId, media);
  }
}

module.exports = GuestCatalogDeliveryService;
