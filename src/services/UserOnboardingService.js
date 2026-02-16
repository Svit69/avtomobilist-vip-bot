const states = require('../constants/onboardingStates');

class UserOnboardingService {
  #storage;

  #formatter;

  constructor(storage, formatter) {
    this.#storage = storage;
    this.#formatter = formatter;
  }

  beginOnboardingForChat(chatId) {
    this.#storage.saveByChatId(chatId, { step: states.WAITING_NAME });
    return [
      'Привет! Я VIP-бот хоккейного клуба «Автомобилист» 🏒',
      'Помогу с сервисом в ложу, мерчем и всем, что нужно по матчу «Автомобилист» vs «Адмирал».',
      `Давайте быстро зарегистрируемся:\n${this.#formatter.formatBold('Как вас зовут')}?`
    ];
  }

  handleOnboardingReply(chatId, inputText) {
    const session = this.#storage.getByChatId(chatId);
    if (!session || !session.step) return { messages: this.beginOnboardingForChat(chatId) };
    if (session.step === states.WAITING_NAME) return this.#handleNameStep(chatId, inputText);
    if (session.step === states.WAITING_LOUNGE) return this.#handleLoungeStep(chatId, inputText, session.name);
    return { messages: ['Вы уже зарегистрированы. Для перезапуска отправьте /start.'] };
  }

  #handleNameStep(chatId, rawName) {
    const name = rawName.trim();
    this.#storage.saveByChatId(chatId, { step: states.WAITING_LOUNGE, name });
    return {
      messages: [`Отлично, ${this.#formatter.formatBold(name)}! 👋\nРады видеть вас в VIP.`, 'Подскажите, пожалуйста, номер или название вашей ложи\n(например: 3, VIP 3, A12).']
    };
  }

  #handleLoungeStep(chatId, rawLounge, name) {
    const lounge = rawLounge.trim();
    this.#storage.saveByChatId(chatId, { step: states.COMPLETED, lounge });
    return { messages: [`Принято! ${this.#formatter.formatBold(name)}, ложа: ${this.#formatter.formatBold(lounge)}.`], completedProfile: { name, lounge } };
  }
}

module.exports = UserOnboardingService;
