class UserShoppingFlowService {
  #catalogDelivery; #cartService; #guestService; #adminId;
  constructor(catalogDelivery, cartService, guestService, adminId) { this.#catalogDelivery = catalogDelivery; this.#cartService = cartService; this.#guestService = guestService; this.#adminId = adminId; }

  async handleTextAction(bot, chatId, text) {
    if (text === 'Благотворительный мерч') { await this.#catalogDelivery.sendCatalog(bot, chatId); return true; }
    if (text === 'Корзина' || text === '/cart' || text === '/pereyti_v_korzinu') return this.#sendCart(bot, chatId);
    if (text === '/menu') { await bot.sendMessage(chatId, 'Пользовательская панель активна.', { reply_markup: this.#userKeyboard(chatId) }); return true; }
    return false;
  }

  async handleCallbackAction(bot, query) {
    if (query.data === 'charity_merch') return this.#sendCatalogFromCallback(bot, query);
    if (query.data === 'checkout_cart') return this.#checkout(bot, query);
    if (!String(query.data).startsWith('add_to_cart:')) return false;
    await this.#safeAnswer(bot, query.id);
    const result = this.#cartService.addProduct(query.message.chat.id, Number(String(query.data).split(':')[1]));
    const text = result.code === 'OK' ? `Добавили в корзину: ${result.product.title}` : result.code === 'NOT_FOUND' ? 'Товар не найден.' : result.code === 'OUT_OF_STOCK' ? 'Товара нет в наличии.' : 'Недостаточно остатка для добавления.';
    await bot.sendMessage(query.message.chat.id, text, { parse_mode: 'HTML' });
    if (result.code === 'OK') await bot.sendMessage(query.message.chat.id, 'Чтобы оформить заказ, вам нужно перейти в корзину: /cart');
    return true;
  }

  async #sendCart(bot, chatId) { const payload = this.#cartService.buildCartPayload(chatId); await bot.sendMessage(chatId, payload.text, { parse_mode: 'HTML', reply_markup: payload.replyMarkup }); return true; }
  async #checkout(bot, query) {
    await this.#safeAnswer(bot, query.id);
    const chatId = query.message.chat.id;
    const order = this.#cartService.checkout(chatId);
    if (order.error) { await bot.sendMessage(chatId, order.error); return true; }
    const summary = order.items.map(item => `${item.title} (${item.quantity} шт)`).join(', ');
    const adminLines = order.items.map(item => `• ${item.title} (${item.quantity} шт)`);
    const lines = order.items.map(item => `• ${item.title} — ${item.quantity} шт.`);
    const total = new Intl.NumberFormat('ru-RU').format(order.total);
    this.#guestService.saveOrderedProduct(chatId, summary);
    await bot.sendMessage(chatId, `<b>Заказ принят, спасибо!</b>\n\nВ вашем заказе:\n${lines.join('\n')}\n\n<b>Общая сумма:</b> от ${total} ₽\n\nНаша ассистентка уже направляется к вашей VIP-ложе с товарами.\nЕсли потребуется что-то ещё — мы рядом и всегда готовы помочь. 🏒`, { parse_mode: 'HTML' });
    const guest = this.#guestService.getGuestByChatId(chatId);
    if (guest && chatId !== this.#adminId) await bot.sendMessage(this.#adminId, `<b>Новый заказ:</b>\nИмя: <b>${guest.name}</b>\nЛожа: <b>${guest.lounge}</b>\nПозиции:\n${adminLines.join('\n')}\n\nОбщая сумма: <b>от ${total} ₽</b>`, { parse_mode: 'HTML' });
    return true;
  }
  async #sendCatalogFromCallback(bot, query) { await this.#safeAnswer(bot, query.id); await this.#catalogDelivery.sendCatalog(bot, query.message.chat.id); return true; }
  #userKeyboard(chatId) { return { keyboard: [[{ text: 'Благотворительный мерч' }, { text: 'Корзина' }], ...(chatId === this.#adminId ? [[{ text: '/admin' }]] : [])], resize_keyboard: true, is_persistent: true }; }
  async #safeAnswer(bot, queryId) { try { await bot.answerCallbackQuery(queryId); } catch (error) { if (!String(error.message).includes('query is too old')) throw error; } }
}

module.exports = UserShoppingFlowService;
