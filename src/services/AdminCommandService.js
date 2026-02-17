class AdminCommandService {
  #adminId;
  #guestService;
  #productService;
  #payloadParser;
  #panelService;

  constructor(adminId, guestService, productService, payloadParser, panelService) {
    this.#adminId = adminId;
    this.#guestService = guestService;
    this.#productService = productService;
    this.#payloadParser = payloadParser;
    this.#panelService = panelService;
  }

  handleAdminCommand(chatId, text) {
    if (!text.startsWith('/admin') || chatId !== this.#adminId) return null;
    if (text === '/admin') return this.#panelService.buildPanelResponse();
    if (text === '/admin_users') return { text: this.#guestService.buildAdminGuestsReport() };
    if (text === '/admin_products') return { text: this.#productService.listProductsText() };
    if (text === '/admin_help') return { text: 'Примеры:\n/admin_product_add Название | Описание | ЦенаОт | Фото1, Фото2\n/admin_product_edit ID | Название | Описание | ЦенаОт | Фото1, Фото2\n/admin_product_delete ID' };
    if (text.startsWith('/admin_product_add ')) return this.#handleAdd(text);
    if (text.startsWith('/admin_product_edit ')) return this.#handleEdit(text);
    if (text.startsWith('/admin_product_delete ')) return this.#handleDelete(text);
    return { text: 'Неизвестная команда админа. Нажмите /admin.' };
  }

  #handleAdd(text) {
    const parsed = this.#payloadParser.parseProductPayload(text.replace('/admin_product_add ', ''));
    if (parsed.error) return { text: parsed.error };
    const item = this.#productService.addProduct(parsed.value);
    return { text: `Карточка добавлена: #${item.id} ${item.title}` };
  }

  #handleEdit(text) {
    const parsed = this.#payloadParser.parseEditPayload(text.replace('/admin_product_edit ', ''));
    if (parsed.error) return { text: parsed.error };
    const item = this.#productService.editProduct(parsed.value.id, parsed.value.payload);
    return item ? { text: `Карточка обновлена: #${item.id} ${item.title}` } : { text: 'Карточка не найдена.' };
  }

  #handleDelete(text) { const id = Number(text.replace('/admin_product_delete ', '').trim()); return { text: Number.isInteger(id) && id > 0 && this.#productService.removeProduct(id) ? `Карточка #${id} удалена.` : 'Не удалось удалить карточку. Проверьте id.' }; }
}

module.exports = AdminCommandService;
