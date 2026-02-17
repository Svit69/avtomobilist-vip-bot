class UserShoppingFlowService {
  #catalogDelivery; #cartService; #guestService; #adminId;
  constructor(catalogDelivery, cartService, guestService, adminId) { this.#catalogDelivery = catalogDelivery; this.#cartService = cartService; this.#guestService = guestService; this.#adminId = adminId; }

  async handleTextAction(bot, chatId, text) {
    if (text === 'Благотворительный мерч') { await this.#catalogDelivery.sendCatalog(bot, chatId); return true; }
    if (text === 'Корзина') return this.#sendCart(bot, chatId);
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
  async #checkout(bot, query) {
    await this.#safeAnswer(bot, query.id);
    const chatId = query.message.chat.id;
    const order = this.#cartService.checkout(chatId);
    if (!order) { await bot.sendMessage(chatId, 'Корзина пуста.'); return true; }
    const summary = order.items.map(item => `${item.title} (${item.quantity} шт)`).join(', ');
    const lines = order.items.map(item => `• ${item.title} — ${item.quantity} шт.`);
    const total = new Intl.NumberFormat('ru-RU').format(order.total);
    this.#guestService.saveOrderedProduct(chatId, summary);
    await bot.sendMessage(chatId, `<b>Заказ принят, спасибо!</b>\n\nВ вашем заказе:\n${lines.join('\n')}\n\n<b>Общая сумма:</b> от ${total} ₽\n\nНаша ассистентка уже направляется к вашей VIP-ложе с товарами.\nЕсли потребуется что-то ещё — мы рядом и всегда готовы помочь. 🏒`, { parse_mode: 'HTML' });
    const guest = this.#guestService.getGuestByChatId(chatId);
    if (guest && chatId !== this.#adminId) await bot.sendMessage(this.#adminId, `Новый заказ:\nИмя: ${guest.name}\nЛожа: ${guest.lounge}\nПозиции: ${summary}\nОбщая сумма: от ${total} ₽`);
    return true;
  }
  async #sendCatalogFromCallback(bot, query) { await this.#safeAnswer(bot, query.id); await this.#catalogDelivery.sendCatalog(bot, query.message.chat.id); return true; }
  #userKeyboard(chatId) { return { keyboard: [[{ text: 'Благотворительный мерч' }, { text: 'Корзина' }], ...(chatId === this.#adminId ? [[{ text: '/admin' }]] : [])], resize_keyboard: true, is_persistent: true }; }
  async #safeAnswer(bot, queryId) { try { await bot.answerCallbackQuery(queryId); } catch (error) { if (!String(error.message).includes('query is too old')) throw error; } }
}

module.exports = UserShoppingFlowService;
