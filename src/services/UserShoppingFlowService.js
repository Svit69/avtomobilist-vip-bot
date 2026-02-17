class UserShoppingFlowService {
  #catalogDelivery;
  #cartService;
  #guestService;
  #adminId;

  constructor(catalogDelivery, cartService, guestService, adminId) {
    this.#catalogDelivery = catalogDelivery;
    this.#cartService = cartService;
    this.#guestService = guestService;
    this.#adminId = adminId;
  }

  async handleTextAction(bot, chatId, text) {
    if (text === 'Благотворительный мерч') { await this.#catalogDelivery.sendCatalog(bot, chatId); return true; }
    if (text === 'Покупки') return this.#sendCart(bot, chatId);
    if (text === '/menu') { await bot.sendMessage(chatId, 'Пользовательская панель активна.', { reply_markup: this.#userKeyboard(chatId) }); return true; }
    return false;
  }

  async handleCallbackAction(bot, query) {
    if (query.data === 'charity_merch') return this.#sendCatalogFromCallback(bot, query);
    if (query.data === 'checkout_cart') return this.#checkout(bot, query);
    if (!String(query.data).startsWith('add_to_cart:')) return false;
    await this.#safeAnswer(bot, query.id);
    const productId = Number(String(query.data).split(':')[1]);
    const product = this.#cartService.addProduct(query.message.chat.id, productId);
    await bot.sendMessage(query.message.chat.id, product ? `Добавили в корзину: ${product.title}` : 'Товар не найден.', { parse_mode: 'HTML' });
    return true;
  }

  async #sendCart(bot, chatId) { const payload = this.#cartService.buildCartPayload(chatId); await bot.sendMessage(chatId, payload.text, { parse_mode: 'HTML', reply_markup: payload.replyMarkup }); return true; }
  async #checkout(bot, query) { await this.#safeAnswer(bot, query.id); const order = this.#cartService.checkout(query.message.chat.id); if (!order) { await bot.sendMessage(query.message.chat.id, 'Корзина пуста.'); return true; } this.#guestService.saveOrderedProduct(query.message.chat.id, order.summary); await bot.sendMessage(query.message.chat.id, `Заказ принят: ${order.summary}`); return true; }
  async #sendCatalogFromCallback(bot, query) { await this.#safeAnswer(bot, query.id); await this.#catalogDelivery.sendCatalog(bot, query.message.chat.id); return true; }
  #userKeyboard(chatId) { return { keyboard: [[{ text: 'Благотворительный мерч' }, { text: 'Покупки' }], ...(chatId === this.#adminId ? [[{ text: '/admin' }]] : [])], resize_keyboard: true, is_persistent: true }; }
  async #safeAnswer(bot, queryId) { try { await bot.answerCallbackQuery(queryId); } catch (error) { if (!String(error.message).includes('query is too old')) throw error; } }
}

module.exports = UserShoppingFlowService;
