class AdminBroadcastDialogService {
  #adminId;
  #storage;
  #guestService;

  constructor(adminId, storage, guestService) { this.#adminId = adminId; this.#storage = storage; this.#guestService = guestService; }

  start(chatId) {
    if (chatId !== this.#adminId) return null;
    this.#storage.saveByChatId(chatId, { adminBroadcastDialog: { step: 'WAITING_TEXT' } });
    return { text: 'Какой текст хотите отправить пользователям?' };
  }

  handleText(chatId, text) {
    const dialog = this.#storage.getByChatId(chatId)?.adminBroadcastDialog;
    if (chatId !== this.#adminId || !dialog || !text) return null;
    if (text.startsWith('/')) return this.#handleCommand(chatId, text, dialog);
    this.#storage.saveByChatId(chatId, { adminBroadcastDialog: { step: 'WAITING_CONFIRM', text } });
    return { text: `Текст рассылки:\n\n${text}\n\nПодтвердите отправку командой /confirm или отмените через /cancel.` };
  }

  cancel(chatId) {
    if (chatId !== this.#adminId || !this.#storage.getByChatId(chatId)?.adminBroadcastDialog) return null;
    this.#storage.saveByChatId(chatId, { adminBroadcastDialog: null });
    return { text: 'Рассылка отменена.' };
  }

  #handleCommand(chatId, text, dialog) {
    if (text !== '/confirm' || dialog.step !== 'WAITING_CONFIRM') return { text: 'Для отмены используйте /cancel. Для отправки используйте /confirm.' };
    const chatIds = this.#guestService.getAllGuestChatIds();
    this.#storage.saveByChatId(chatId, { adminBroadcastDialog: null });
    return { text: `Рассылка отправлена (${chatIds.length} получателей).`, broadcast: { chatIds, text: dialog.text } };
  }
}

module.exports = AdminBroadcastDialogService;
