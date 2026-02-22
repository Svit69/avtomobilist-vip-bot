const states = require('../constants/adminProductEditDialogStates');

class AdminProductEditDialogService {
  #adminId; #storage; #productService;
  constructor(adminId, storage, productService) { this.#adminId = adminId; this.#storage = storage; this.#productService = productService; }
  startDialog(chatId) { if (!this.#isAdmin(chatId)) return null; if (!this.#productService.getProductIds().length) return { text: 'Каталог пуст.' }; this.#save(chatId, { state: states.WAITING_PRODUCT_ID }); return { text: `Редактирование товара:\n${this.#productService.listProductsText()}\n\nШаг 1/6. Введите ID позиции.` }; }
  cancel(chatId) { if (!this.#isAdmin(chatId) || !this.#get(chatId)) return null; this.#save(chatId, null); return { text: 'Редактирование товара отменено.' }; }
  handleStep(chatId, msg) {
    const dialog = this.#isAdmin(chatId) ? this.#get(chatId) : null;
    if (!dialog) return null;
    if (msg.text === '/confirm' && dialog.state === states.WAITING_CONFIRMATION) return this.#confirm(chatId, dialog);
    if (msg.text === '/skip') return this.#skip(chatId, dialog);
    if (msg.text && msg.text.startsWith('/')) return { text: 'Во время редактирования доступны /skip, /confirm и /cancel.' };
    if (dialog.state === states.WAITING_PRODUCT_ID) return this.#selectProduct(chatId, msg.text);
    if (dialog.state === states.WAITING_TITLE) return this.#saveTitle(chatId, msg.text, dialog);
    if (dialog.state === states.WAITING_PHOTO) return this.#savePhoto(chatId, msg, dialog);
    if (dialog.state === states.WAITING_DESCRIPTION) return this.#saveDescription(chatId, msg.text, dialog);
    if (dialog.state === states.WAITING_PRICE) return this.#savePrice(chatId, msg.text, dialog);
    return { text: 'Подтвердите изменения через /confirm или отмените через /cancel.' };
  }
  #selectProduct(chatId, text) { const id = Number(String(text || '').trim()); const p = Number.isInteger(id) ? this.#productService.getProductById(id) : null; if (!p) return { text: 'Позиция не найдена. Введите корректный ID из списка.' }; const d = { productId: p.id, state: states.WAITING_TITLE, draft: { title: p.title, description: p.description, photos: p.photos || [], priceFrom: p.priceFrom } }; this.#save(chatId, d); return { text: `Шаг 2/6. Название (текущее: ${p.title}).\nВведите новое значение или /skip.` }; }
  #saveTitle(chatId, text, dialog) { if (!text || !text.trim()) return { text: 'Введите название или /skip.' }; this.#save(chatId, { ...dialog, state: states.WAITING_PHOTO, draft: { ...dialog.draft, title: text.trim() } }); return { text: 'Шаг 3/6. Фото товара.\nПришлите новое фото/ссылку или /skip.' }; }
  #savePhoto(chatId, msg, dialog) { const photoId = msg.photo?.length ? msg.photo[msg.photo.length - 1].file_id : null; const url = msg.text && /^https?:\/\//i.test(msg.text.trim()) ? msg.text.trim() : null; if (!photoId && !url) return { text: 'Пришлите фото файлом в Telegram, ссылку или /skip.' }; this.#save(chatId, { ...dialog, state: states.WAITING_DESCRIPTION, draft: { ...dialog.draft, photos: [photoId || url] } }); return { text: `Шаг 4/6. Описание (текущее: ${dialog.draft.description || '—'}).\nВведите новое значение или /skip.` }; }
  #saveDescription(chatId, text, dialog) { if (!text || !text.trim()) return { text: 'Введите описание или /skip.' }; this.#save(chatId, { ...dialog, state: states.WAITING_PRICE, draft: { ...dialog.draft, description: text.trim() } }); return { text: `Шаг 5/6. Цена (текущая: ${dialog.draft.priceFrom} ₽).\nВведите новую цену или /skip.` }; }
  #savePrice(chatId, text, dialog) { const value = Number(String(text || '').replace(',', '.')); if (!Number.isFinite(value) || value <= 0) return { text: 'Цена должна быть числом больше 0 или используйте /skip.' }; const next = { ...dialog, state: states.WAITING_CONFIRMATION, draft: { ...dialog.draft, priceFrom: value } }; this.#save(chatId, next); return this.#buildConfirm(next); }
  #skip(chatId, dialog) { if (dialog.state === states.WAITING_TITLE) return this.#move(chatId, dialog, states.WAITING_PHOTO, 'Шаг 3/6. Фото товара.\nПришлите новое фото/ссылку или /skip.'); if (dialog.state === states.WAITING_PHOTO) return this.#move(chatId, dialog, states.WAITING_DESCRIPTION, `Шаг 4/6. Описание (текущее: ${dialog.draft.description || '—'}).\nВведите новое значение или /skip.`); if (dialog.state === states.WAITING_DESCRIPTION) return this.#move(chatId, dialog, states.WAITING_PRICE, `Шаг 5/6. Цена (текущая: ${dialog.draft.priceFrom} ₽).\nВведите новую цену или /skip.`); if (dialog.state === states.WAITING_PRICE) { const next = { ...dialog, state: states.WAITING_CONFIRMATION }; this.#save(chatId, next); return this.#buildConfirm(next); } return { text: 'Сейчас /skip недоступна.' }; }
  #buildConfirm(dialog) { const d = dialog.draft; return { text: `Шаг 6/6. Проверьте изменения:\nНазвание: ${d.title}\nОписание: ${d.description}\nЦена: ${d.priceFrom} ₽\nФото: ${d.photos?.length ? 'обновлено/сохранено' : 'нет'}\n\nОтправьте /confirm для сохранения или /cancel для отмены.` }; }
  #confirm(chatId, dialog) { const item = this.#productService.editProduct(dialog.productId, dialog.draft); this.#save(chatId, null); return item ? { text: `Карточка обновлена: #${item.id} ${item.title}` } : { text: 'Карточка не найдена.' }; }
  #move(chatId, dialog, state, text) { this.#save(chatId, { ...dialog, state }); return { text }; }
  #isAdmin(chatId) { return chatId === this.#adminId; }
  #get(chatId) { return this.#storage.getByChatId(chatId)?.adminEditDialog || null; }
  #save(chatId, adminEditDialog) { this.#storage.saveByChatId(chatId, { adminEditDialog }); }
}

module.exports = AdminProductEditDialogService;
