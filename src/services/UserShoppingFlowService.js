class UserShoppingFlowService {
  #catalogDelivery;
  #cartService;

  constructor(catalogDelivery, cartService) {
    this.#catalogDelivery = catalogDelivery;
    this.#cartService = cartService;
  }

  async handleTextAction(bot, chatId, text) {
    if (text === 'Благотворительный мерч') { await this.#catalogDelivery.sendCatalog(bot, chatId); return true; }
    if (text === 'Покупки') { await bot.sendMessage(chatId, this.#cartService.buildCartText(chatId), { parse_mode: 'HTML' }); return true; }
    return false;
  }

  async handleCallbackAction(bot, query) {
    if (query.data === 'charity_merch') return this.#sendCatalogFromCallback(bot, query);
    if (!String(query.data).startsWith('add_to_cart:')) return false;
    await this.#safeAnswer(bot, query.id);
    const productId = Number(String(query.data).split(':')[1]);
    const product = this.#cartService.addProduct(query.message.chat.id, productId);
    const text = product ? `Добавили в корзину: ${product.title}` : 'Товар не найден.';
    await bot.sendMessage(query.message.chat.id, text, { parse_mode: 'HTML' });
    return true;
  }

  async #sendCatalogFromCallback(bot, query) { await this.#safeAnswer(bot, query.id); await this.#catalogDelivery.sendCatalog(bot, query.message.chat.id); return true; }
  async #safeAnswer(bot, queryId) { try { await bot.answerCallbackQuery(queryId); } catch (error) { if (!String(error.message).includes('query is too old')) throw error; } }
}

module.exports = UserShoppingFlowService;
