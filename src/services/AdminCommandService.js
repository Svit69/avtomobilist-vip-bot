class AdminCommandService {
  #adminId; #guestService; #productService; #payloadParser; #panelService; #productDialogService; #quantityDialogService; #broadcastDialogService;

  constructor(adminId, guestService, productService, payloadParser, panelService, productDialogService, quantityDialogService, broadcastDialogService) {
    this.#adminId = adminId; this.#guestService = guestService; this.#productService = productService; this.#payloadParser = payloadParser;
    this.#panelService = panelService; this.#productDialogService = productDialogService; this.#quantityDialogService = quantityDialogService; this.#broadcastDialogService = broadcastDialogService;
  }

  handleAdminCommand(chatId, text) {
    if (!text.startsWith('/admin') || chatId !== this.#adminId) return null;
    if (text === '/admin') return this.#panelService.buildPanelResponse();
    if (text === '/admin_users') return { text: this.#guestService.buildAdminGuestsReport() };
    if (text === '/admin_products') return { text: this.#productService.listProductsText() };
    if (text === '/admin_product_add') return this.#productDialogService.startDialog(chatId);
    if (text === '/admin_product_quantity') return this.#quantityDialogService.start(chatId);
    if (text === '/admin_broadcast') return this.#broadcastDialogService.start(chatId);
    if (text === '/admin_help') return { text: 'Рассылка: /admin_broadcast\nДиалог добавления: /admin_product_add\nДиалог редактирования: /admin_product_edit\nДиалог остатков: /admin_product_quantity\nПодтверждение: /confirm\nПропустить шаг: /skip\nОтмена: /cancel\n\nБыстрые команды:\n/admin_product_edit_quick ID | Название | Описание | Цена | Фото1, Фото2 | Количество\n/admin_product_delete ID' };
    if (text === '/admin_product_edit') return this.#productDialogService.startEditDialog(chatId);
    if (text === '/admin_product_edit_quick') return { text: 'Формат: /admin_product_edit_quick ID | Название | Описание | Цена | Фото1, Фото2 | Количество' };
    if (text === '/admin_product_delete') return { text: 'Формат: /admin_product_delete ID' };
    if (text.startsWith('/admin_product_edit_quick ')) return this.#handleEdit(text, '/admin_product_edit_quick ');
    if (text.startsWith('/admin_product_edit ')) return { text: 'Команда /admin_product_edit теперь работает в диалоге. Отправьте /admin_product_edit и следуйте шагам.' };
    if (text.startsWith('/admin_product_delete ')) return this.#handleDelete(text);
    return { text: 'Неизвестная команда админа. Нажмите /admin.' };
  }

  #handleEdit(text, prefix) { const parsed = this.#payloadParser.parseEditPayload(text.replace(prefix, '')); if (parsed.error) return { text: parsed.error }; const item = this.#productService.editProduct(parsed.value.id, parsed.value.payload); return item ? { text: `Карточка обновлена: #${item.id} ${item.title}` } : { text: 'Карточка не найдена.' }; }
  #handleDelete(text) { const id = Number(text.replace('/admin_product_delete ', '').trim()); return { text: Number.isInteger(id) && id > 0 && this.#productService.removeProduct(id) ? `Карточка #${id} удалена.` : 'Не удалось удалить карточку. Проверьте id.' }; }
}

module.exports = AdminCommandService;
