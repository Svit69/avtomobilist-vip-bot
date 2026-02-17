const TelegramBot = require('node-telegram-bot-api');

class VipTelegramBot {
  #bot; #onboardingService; #guestMenuService; #guestRegistryService; #adminCommandService; #guestCatalogDeliveryService; #adminId;

  constructor(token, onboardingService, guestMenuService, guestRegistryService, adminCommandService, guestCatalogDeliveryService, adminId) {
    this.#bot = new TelegramBot(token, { polling: true });
    this.#onboardingService = onboardingService;
    this.#guestMenuService = guestMenuService;
    this.#guestRegistryService = guestRegistryService;
    this.#adminCommandService = adminCommandService;
    this.#guestCatalogDeliveryService = guestCatalogDeliveryService;
    this.#adminId = adminId;
  }

  startPolling() {
    this.#bot.onText(/^\/start$/, msg => this.#sendMessages(msg.chat.id, this.#onboardingService.beginOnboardingForChat(msg.chat.id)));
    this.#bot.on('message', msg => this.#handleIncomingMessage(msg));
    this.#bot.on('callback_query', query => this.#handleCallbackQuery(query));
  }

  async #handleIncomingMessage(msg) {
    if (!msg.text) return;
    const adminResponse = this.#adminCommandService.handleAdminCommand(msg.chat.id, msg.text);
    if (adminResponse) return this.#sendFormattedMessage(msg.chat.id, adminResponse.text);
    if (msg.text.startsWith('/')) return;
    const result = this.#onboardingService.handleOnboardingReply(msg.chat.id, msg.text);
    await this.#sendMessages(msg.chat.id, result.messages);
    if (!result.completedProfile) return;
    this.#guestRegistryService.saveRegistration(msg.chat.id, result.completedProfile);
    if (msg.chat.id !== this.#adminId) await this.#notifyAdmin(msg.chat.id, result.completedProfile);
    await this.#sendGuestMenu(msg.chat.id, result.completedProfile);
  }

  async #handleCallbackQuery(query) { if (query.data !== 'charity_merch') return; await this.#bot.answerCallbackQuery(query.id); await this.#guestCatalogDeliveryService.sendCatalog(this.#bot, query.message.chat.id); }
  async #sendGuestMenu(chatId, profile) { const offer = this.#guestMenuService.buildCharityMerchOffer(profile); await this.#bot.sendMessage(chatId, offer.text, { parse_mode: 'HTML', reply_markup: offer.replyMarkup }); }
  async #notifyAdmin(chatId, profile) { await this.#sendFormattedMessage(this.#adminId, `Новая регистрация:\nID: ${chatId}\nИмя: ${profile.name}\nЛожа: ${profile.lounge}`); }
  async #sendMessages(chatId, messages) { for (const text of messages) await this.#sendFormattedMessage(chatId, text); }
  async #sendFormattedMessage(chatId, text) { await this.#bot.sendMessage(chatId, text, { parse_mode: 'HTML' }); }
}

module.exports = VipTelegramBot;
