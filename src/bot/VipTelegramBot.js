const TelegramBot = require('node-telegram-bot-api');
class VipTelegramBot {
  #bot; #onboardingService; #guestMenuService; #guestRegistryService; #adminCommandService; #adminProductDialogService; #adminQuantityDialogService; #adminBroadcastDialogService; #cartDeleteDialogService; #userShoppingFlowService; #adminId;
  constructor(token, onboardingService, guestMenuService, guestRegistryService, adminCommandService, adminProductDialogService, adminQuantityDialogService, adminBroadcastDialogService, cartDeleteDialogService, userShoppingFlowService, adminId) {
    this.#bot = new TelegramBot(token, { polling: true });
    this.#onboardingService = onboardingService; this.#guestMenuService = guestMenuService; this.#guestRegistryService = guestRegistryService;
    this.#adminCommandService = adminCommandService; this.#adminProductDialogService = adminProductDialogService; this.#adminQuantityDialogService = adminQuantityDialogService;
    this.#adminBroadcastDialogService = adminBroadcastDialogService; this.#cartDeleteDialogService = cartDeleteDialogService; this.#userShoppingFlowService = userShoppingFlowService; this.#adminId = adminId;
  }
  startPolling() {
    this.#bot.onText(/^\/start$/, msg => this.#safeRun(() => this.#sendMessages(msg.chat.id, this.#onboardingService.beginOnboardingForChat(msg.chat.id))));
    this.#bot.on('message', msg => this.#safeRun(() => this.#handleIncomingMessage(msg)));
    this.#bot.on('callback_query', query => this.#safeRun(() => this.#handleCallbackQuery(query)));
    this.#bot.on('polling_error', error => console.error('polling_error:', error.message));
  }
  async #handleIncomingMessage(msg) {
    if (!msg.text && !msg.photo) return;
    const chatId = msg.chat.id;
    const cancel = msg.text === '/cancel' ? this.#adminProductDialogService.cancel(chatId) || this.#adminQuantityDialogService.cancel(chatId) || this.#adminBroadcastDialogService.cancel(chatId) || this.#cartDeleteDialogService.cancel(chatId) : null;
    if (cancel) return this.#sendAdminResponse(chatId, cancel);
    if (msg.text === '/delete') return this.#sendAdminResponse(chatId, this.#cartDeleteDialogService.start(chatId));
    const adminResponse = msg.text ? this.#adminCommandService.handleAdminCommand(chatId, msg.text) : null;
    if (adminResponse) return this.#sendAdminResponse(chatId, adminResponse);
    const adminQtyResponse = msg.text ? this.#adminQuantityDialogService.handleText(chatId, msg.text) : null;
    if (adminQtyResponse) return this.#sendAdminResponse(chatId, adminQtyResponse);
    const broadcastResponse = msg.text ? this.#adminBroadcastDialogService.handleText(chatId, msg.text) : null;
    if (broadcastResponse) { if (broadcastResponse.broadcast) await this.#sendBroadcast(broadcastResponse.broadcast.chatIds, broadcastResponse.broadcast.text); return this.#sendAdminResponse(chatId, broadcastResponse); }
    const deleteResponse = msg.text ? this.#cartDeleteDialogService.handleText(chatId, msg.text) : null;
    if (deleteResponse) return this.#sendAdminResponse(chatId, deleteResponse);
    const dialogResponse = this.#adminProductDialogService.handleStep(chatId, msg);
    if (dialogResponse) return this.#sendAdminResponse(chatId, dialogResponse);
    if (msg.text && await this.#userShoppingFlowService.handleTextAction(this.#bot, chatId, msg.text)) return;
    if (!msg.text || msg.text.startsWith('/')) return;
    const result = this.#onboardingService.handleOnboardingReply(chatId, msg.text);
    await this.#sendMessages(chatId, result.messages);
    if (!result.completedProfile) return;
    this.#guestRegistryService.saveRegistration(chatId, result.completedProfile);
    if (chatId !== this.#adminId) await this.#notifyAdmin(chatId, result.completedProfile);
    await this.#sendGuestMenu(chatId, result.completedProfile);
  }
  async #handleCallbackQuery(query) { const adminQty = this.#adminQuantityDialogService.handleCallback(query.message.chat.id, query.data); if (adminQty) { await this.#bot.answerCallbackQuery(query.id); return this.#sendAdminResponse(query.message.chat.id, adminQty); } if (await this.#userShoppingFlowService.handleCallbackAction(this.#bot, query)) return; }
  async #sendBroadcast(chatIds, text) { for (const id of chatIds) await this.#sendFormattedMessage(id, text); }
  async #safeRun(action) { try { await action(); } catch (error) { console.error('bot_handler_error:', error.message); } }
  async #sendAdminResponse(chatId, response) { await this.#bot.sendMessage(chatId, response.text, { parse_mode: 'HTML', ...(response.replyMarkup ? { reply_markup: response.replyMarkup } : {}) }); }
  async #sendGuestMenu(chatId, profile) { const offer = this.#guestMenuService.buildCharityMerchOffer(profile, chatId === this.#adminId); await this.#bot.sendMessage(chatId, offer.text, { parse_mode: 'HTML', reply_markup: offer.replyMarkup }); }
  async #notifyAdmin(chatId, profile) { await this.#sendFormattedMessage(this.#adminId, `Новая регистрация:\nID: ${chatId}\nИмя: ${profile.name}\nЛожа: ${profile.lounge}`); }
  async #sendMessages(chatId, messages) { for (const text of messages) await this.#sendFormattedMessage(chatId, text); }
  async #sendFormattedMessage(chatId, text) { await this.#bot.sendMessage(chatId, text, { parse_mode: 'HTML' }); }
}
module.exports = VipTelegramBot;
