const AdminProductAddDialogService = require('./AdminProductAddDialogService');
const AdminProductEditDialogService = require('./AdminProductEditDialogService');

class AdminProductDialogService {
  #addDialog; #editDialog;
  constructor(adminId, storage, productService) {
    this.#addDialog = new AdminProductAddDialogService(adminId, storage, productService);
    this.#editDialog = new AdminProductEditDialogService(adminId, storage, productService);
  }
  startDialog(chatId) { return this.#addDialog.startDialog(chatId); }
  startEditDialog(chatId) { return this.#editDialog.startDialog(chatId); }
  cancel(chatId) { return this.#addDialog.cancel(chatId) || this.#editDialog.cancel(chatId); }
  handleStep(chatId, msg) { return this.#addDialog.handleStep(chatId, msg) || this.#editDialog.handleStep(chatId, msg); }
}

module.exports = AdminProductDialogService;
