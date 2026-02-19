class AdminCommandService {
  #adminId; #guestService; #productService; #payloadParser; #panelService; #productDialogService; #quantityDialogService;

  constructor(adminId, guestService, productService, payloadParser, panelService, productDialogService, quantityDialogService) {
    this.#adminId = adminId; this.#guestService = guestService; this.#productService = productService; this.#payloadParser = payloadParser;
    this.#panelService = panelService; this.#productDialogService = productDialogService; this.#quantityDialogService = quantityDialogService;
  }

  handleAdminCommand(chatId, text) {
    if (!text.startsWith('/admin') || chatId !== this.#adminId) return null;
    if (text === '/admin') return this.#panelService.buildPanelResponse();
    if (text === '/admin_users') return { text: this.#guestService.buildAdminGuestsReport() };
    if (text === '/admin_products') return { text: this.#productService.listProductsText() };
    if (text === '/admin_product_add') return this.#productDialogService.startDialog(chatId);
    if (text === '/admin_product_quantity') return this.#quantityDialogService.start(chatId);
    if (text === '/admin_help') return { text: 'Диалог добавления: /admin_product_add\nДиалог остатков: /admin_product_quantity\nПодтверждение: /confirm\nОтмена: /cancel\n\nБыстрые команды:\n/admin_product_edit ID | Название | Описание | Цена | Фото1, Фото2 | Количество\n/admin_product_delete ID' };
    if (text === '/admin_product_edit') return { text: 'Формат: /admin_product_edit ID | Название | Описание | Цена | Фото1, Фото2 | Количество' };
    if (text === '/admin_product_delete') return { text: 'Формат: /admin_product_delete ID' };
    if (text.startsWith('/admin_product_edit ')) return this.#handleEdit(text);
    if (text.startsWith('/admin_product_delete ')) return this.#handleDelete(text);
    return { text: 'Неизвестная команда админа. Нажмите /admin.' };
  }

  #handleEdit(text) { const parsed = this.#payloadParser.parseEditPayload(text.replace('/admin_product_edit ', '')); if (parsed.error) return { text: parsed.error }; const item = this.#productService.editProduct(parsed.value.id, parsed.value.payload); return item ? { text: `Карточка обновлена: #${item.id} ${item.title}` } : { text: 'Карточка не найдена.' }; }
  #handleDelete(text) { const id = Number(text.replace('/admin_product_delete ', '').trim()); return { text: Number.isInteger(id) && id > 0 && this.#productService.removeProduct(id) ? `Карточка #${id} удалена.` : 'Не удалось удалить карточку. Проверьте id.' }; }
}

module.exports = AdminCommandService;
