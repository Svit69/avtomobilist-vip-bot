class GuestCatalogDeliveryService {
  #guestCatalogService;

  constructor(guestCatalogService) {
    this.#guestCatalogService = guestCatalogService;
  }

  async sendCatalog(bot, chatId) {
    const payload = this.#guestCatalogService.buildGuestCatalogPayload();
    if (payload.emptyMessage) return bot.sendMessage(chatId, payload.emptyMessage, { parse_mode: 'HTML' });
    for (let i = 0; i < payload.photos.length; i += 10) {
      const group = payload.photos.slice(i, i + 10).map(photo => ({ type: 'photo', media: photo }));
      if (group.length) await bot.sendMediaGroup(chatId, group);
    }
    await bot.sendMessage(chatId, payload.text, { parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: { inline_keyboard: payload.buttons } });
  }
}

module.exports = GuestCatalogDeliveryService;
