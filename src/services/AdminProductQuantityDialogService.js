class AdminProductQuantityDialogService {
  #adminId;
  #storage;
  #productService;

  constructor(adminId, storage, productService) { this.#adminId = adminId; this.#storage = storage; this.#productService = productService; }

  start(chatId) {
    if (chatId !== this.#adminId) return null;
    const keyboard = this.#productService.buildQuantityButtons();
    if (!keyboard.length) return { text: 'Каталог пуст.', replyMarkup: null };
    return { text: 'Выберите позицию для изменения количества:', replyMarkup: { inline_keyboard: keyboard } };
  }

  handleCallback(chatId, data) {
    if (chatId !== this.#adminId || !String(data).startsWith('admin_qty_select:')) return null;
    const productId = Number(String(data).split(':')[1]);
    this.#storage.saveByChatId(chatId, { adminQuantityDialog: { productId } });
    return { text: `Введите новое количество для позиции #${productId}:` };
  }

  handleText(chatId, text) {
    const dialog = this.#storage.getByChatId(chatId)?.adminQuantityDialog;
    if (chatId !== this.#adminId || !dialog) return null;
    const quantity = Number(String(text || '').trim());
    if (!Number.isInteger(quantity) || quantity < 0) return { text: 'Количество должно быть целым числом от 0.' };
    const updated = this.#productService.setProductQuantity(dialog.productId, quantity);
    this.#storage.saveByChatId(chatId, { adminQuantityDialog: null });
    return updated ? { text: `Количество обновлено: #${updated.id} ${updated.title} = ${updated.quantity} шт.` } : { text: 'Позиция не найдена.' };
  }

  cancel(chatId) {
    if (chatId !== this.#adminId || !this.#storage.getByChatId(chatId)?.adminQuantityDialog) return null;
    this.#storage.saveByChatId(chatId, { adminQuantityDialog: null });
    return { text: 'Изменение количества отменено.' };
  }
}

module.exports = AdminProductQuantityDialogService;
