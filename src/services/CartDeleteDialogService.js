class CartDeleteDialogService {
  #storage;
  #cartService;

  constructor(storage, cartService) { this.#storage = storage; this.#cartService = cartService; }

  start(chatId) {
    const items = this.#cartService.getCartItems(chatId);
    if (!items.length) return { text: 'Корзина пуста.' };
    this.#storage.saveByChatId(chatId, { cartDeleteDialog: { active: true } });
    const lines = items.map((item, i) => `${i + 1}. ${item.title} (${item.quantity} шт)`);
    return { text: `Какой товар хотите удалить из корзины?\n${lines.join('\n')}\n${items.length + 1}. удалить все позиции` };
  }

  handleText(chatId, text) {
    const active = this.#storage.getByChatId(chatId)?.cartDeleteDialog?.active;
    if (!active || !text || text.startsWith('/')) return null;
    const items = this.#cartService.getCartItems(chatId);
    const selected = Number(String(text).trim());
    if (!Number.isInteger(selected) || selected < 1 || selected > items.length + 1) return { text: `Введите номер позиции от 1 до ${items.length + 1} или /cancel.` };
    this.#storage.saveByChatId(chatId, { cartDeleteDialog: null });
    if (selected === items.length + 1) { this.#cartService.removeAll(chatId); return { text: 'Все позиции удалены из корзины.', showCart: true }; }
    const removed = this.#cartService.removeItemByIndex(chatId, selected - 1);
    return removed ? { text: `Удалили из корзины: ${removed.title}`, showCart: true } : { text: 'Не удалось удалить позицию.' };
  }

  cancel(chatId) {
    const active = this.#storage.getByChatId(chatId)?.cartDeleteDialog?.active;
    if (!active) return null;
    this.#storage.saveByChatId(chatId, { cartDeleteDialog: null });
    return { text: 'Удаление из корзины отменено.' };
  }
}

module.exports = CartDeleteDialogService;
