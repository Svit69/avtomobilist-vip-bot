const TelegramBot = require('node-telegram-bot-api');

class VipTelegramBot {
  #bot;
  #onboardingService;
  #guestMenuService;
  #adminId;

  constructor(token, onboardingService, guestMenuService, adminId) {
    this.#bot = new TelegramBot(token, { polling: true });
    this.#onboardingService = onboardingService;
    this.#guestMenuService = guestMenuService;
    this.#adminId = adminId;
  }

  startPolling() {
    this.#bot.onText(/^\/start$/, msg => this.#handleStartCommand(msg));
    this.#bot.on('message', msg => this.#handleIncomingMessage(msg));
  }

  async #handleStartCommand(msg) {
    const messages = this.#onboardingService.beginOnboardingForChat(msg.chat.id);
    for (const text of messages) await this.#sendFormattedMessage(msg.chat.id, text);
  }

  async #handleIncomingMessage(msg) {
    if (!msg.text || msg.text.startsWith('/')) return;
    const result = this.#onboardingService.handleOnboardingReply(msg.chat.id, msg.text);
    for (const text of result.messages) await this.#sendFormattedMessage(msg.chat.id, text);
    if (!result.completedProfile) return;
    await this.#notifyAdminAboutRegistration(msg.chat.id, result.completedProfile);
    await this.#sendGuestMenu(msg.chat.id, result.completedProfile);
  }

  async #sendGuestMenu(chatId, profile) {
    const offer = this.#guestMenuService.buildCharityMerchOffer(profile);
    await this.#bot.sendMessage(chatId, offer.text, { parse_mode: 'HTML', reply_markup: offer.replyMarkup });
  }

  async #notifyAdminAboutRegistration(chatId, profile) {
    const text = `Новая регистрация:\nID: ${chatId}\nИмя: ${profile.name}\nЛожа: ${profile.lounge}`;
    await this.#sendFormattedMessage(this.#adminId, text);
  }

  async #sendFormattedMessage(chatId, text) {
    await this.#bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  }
}

module.exports = VipTelegramBot;
