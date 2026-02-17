const states = require('../constants/adminProductDialogStates');

class AdminProductDialogService {
  #adminId; #storage; #productService;

  constructor(adminId, storage, productService) { this.#adminId = adminId; this.#storage = storage; this.#productService = productService; }
  startDialog(chatId) { if (!this.#isAdmin(chatId)) return null; this.#saveDialog(chatId, { state: states.WAITING_TITLE, draft: { photos: [] } }); return { text: 'Добавление товара:\nШаг 1/5. Введите название товара.' }; }
  cancel(chatId) { if (!this.#isAdmin(chatId) || !this.#getDialog(chatId)) return null; this.#saveDialog(chatId, null); return { text: 'Добавление товара отменено.' }; }

  handleStep(chatId, msg) {
    const dialog = this.#isAdmin(chatId) ? this.#getDialog(chatId) : null;
    if (!dialog) return null;
    if (msg.text === '/confirm' && dialog.state === states.WAITING_CONFIRMATION) return this.#confirm(chatId, dialog.draft);
    if (msg.text && msg.text.startsWith('/')) return { text: 'Во время добавления доступны только /confirm и /cancel.' };
    if (dialog.state === states.WAITING_TITLE) return this.#saveTitle(chatId, msg.text, dialog.draft);
    if (dialog.state === states.WAITING_DESCRIPTION) return this.#saveDescription(chatId, msg.text, dialog.draft);
    if (dialog.state === states.WAITING_PHOTO) return this.#savePhoto(chatId, msg, dialog.draft);
    if (dialog.state === states.WAITING_PRICE) return this.#savePrice(chatId, msg.text, dialog.draft);
    return { text: 'Подтвердите добавление через /confirm или отмените через /cancel.' };
  }

  #saveTitle(chatId, text, draft) { if (!text || !text.trim()) return { text: 'Введите корректное название товара.' }; this.#saveDialog(chatId, { state: states.WAITING_DESCRIPTION, draft: { ...draft, title: text.trim() } }); return { text: 'Шаг 2/5. Введите описание товара.' }; }
  #saveDescription(chatId, text, draft) { if (!text || !text.trim()) return { text: 'Введите корректное описание товара.' }; this.#saveDialog(chatId, { state: states.WAITING_PHOTO, draft: { ...draft, description: text.trim() } }); return { text: 'Шаг 3/5. Отправьте фотографию товара (или ссылку на фото).' }; }
  #savePhoto(chatId, msg, draft) { const photoId = msg.photo?.length ? msg.photo[msg.photo.length - 1].file_id : null; const url = msg.text && /^https?:\/\//i.test(msg.text.trim()) ? msg.text.trim() : null; if (!photoId && !url) return { text: 'Пришлите фото файлом в Telegram или ссылку на изображение.' }; this.#saveDialog(chatId, { state: states.WAITING_PRICE, draft: { ...draft, photos: [photoId || url] } }); return { text: 'Шаг 4/5. Введите цену (числом, например: 2500).' }; }
  #savePrice(chatId, text, draft) { const value = Number(String(text || '').replace(',', '.')); if (!Number.isFinite(value) || value <= 0) return { text: 'Цена должна быть числом больше 0.' }; const next = { ...draft, priceFrom: value }; this.#saveDialog(chatId, { state: states.WAITING_CONFIRMATION, draft: next }); return { text: `Шаг 5/5. Проверьте данные:\nНазвание: ${next.title}\nОписание: ${next.description}\nЦена: от ${next.priceFrom} ₽\nФото: ${next.photos.length}\n\nОтправьте /confirm для сохранения или /cancel для отмены.` }; }

  #confirm(chatId, draft) { const item = this.#productService.addProduct(draft); this.#saveDialog(chatId, null); return { text: `Товар сохранён: #${item.id} ${item.title}` }; }
  #isAdmin(chatId) { return chatId === this.#adminId; }
  #getDialog(chatId) { return this.#storage.getByChatId(chatId)?.adminDialog || null; }
  #saveDialog(chatId, adminDialog) { this.#storage.saveByChatId(chatId, { adminDialog }); }
}

module.exports = AdminProductDialogService;
