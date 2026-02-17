const TelegramBot = require('node-telegram-bot-api');

class VipTelegramBot {
  #bot; #onboardingService; #guestMenuService; #guestRegistryService; #adminCommandService; #adminProductDialogService; #guestCatalogDeliveryService; #adminId;
  constructor(token, onboardingService, guestMenuService, guestRegistryService, adminCommandService, adminProductDialogService, guestCatalogDeliveryService, adminId) {
    this.#bot = new TelegramBot(token, { polling: true });
    this.#onboardingService = onboardingService;
    this.#guestMenuService = guestMenuService;
    this.#guestRegistryService = guestRegistryService;
    this.#adminCommandService = adminCommandService;
    this.#adminProductDialogService = adminProductDialogService;
    this.#guestCatalogDeliveryService = guestCatalogDeliveryService;
    this.#adminId = adminId;
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
    const cancelResponse = msg.text === '/cancel' ? this.#adminProductDialogService.cancel(chatId) : null;
    if (cancelResponse) return this.#sendAdminResponse(chatId, cancelResponse);
    const adminResponse = msg.text ? this.#adminCommandService.handleAdminCommand(chatId, msg.text) : null;
    if (adminResponse) return this.#sendAdminResponse(chatId, adminResponse);
    const dialogResponse = this.#adminProductDialogService.handleStep(chatId, msg);
    if (dialogResponse) return this.#sendAdminResponse(chatId, dialogResponse);
    if (!msg.text || msg.text.startsWith('/')) return;
    const result = this.#onboardingService.handleOnboardingReply(chatId, msg.text);
    await this.#sendMessages(chatId, result.messages);
    if (!result.completedProfile) return;
    this.#guestRegistryService.saveRegistration(chatId, result.completedProfile);
    if (chatId !== this.#adminId) await this.#notifyAdmin(chatId, result.completedProfile);
    await this.#sendGuestMenu(chatId, result.completedProfile);
  }

  async #handleCallbackQuery(query) { if (query.data !== 'charity_merch') return; try { await this.#bot.answerCallbackQuery(query.id); } catch (error) { if (!String(error.message).includes('query is too old')) throw error; } await this.#guestCatalogDeliveryService.sendCatalog(this.#bot, query.message.chat.id); }
  async #safeRun(action) { try { await action(); } catch (error) { console.error('bot_handler_error:', error.message); } }
  async #sendAdminResponse(chatId, response) { await this.#bot.sendMessage(chatId, response.text, { parse_mode: 'HTML', reply_markup: response.replyMarkup }); }
  async #sendGuestMenu(chatId, profile) { const offer = this.#guestMenuService.buildCharityMerchOffer(profile); await this.#bot.sendMessage(chatId, offer.text, { parse_mode: 'HTML', reply_markup: offer.replyMarkup }); }
  async #notifyAdmin(chatId, profile) { await this.#sendFormattedMessage(this.#adminId, `Новая регистрация:\nID: ${chatId}\nИмя: ${profile.name}\nЛожа: ${profile.lounge}`); }
  async #sendMessages(chatId, messages) { for (const text of messages) await this.#sendFormattedMessage(chatId, text); }
  async #sendFormattedMessage(chatId, text) { await this.#bot.sendMessage(chatId, text, { parse_mode: 'HTML' }); }
}

module.exports = VipTelegramBot;
