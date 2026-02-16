const states = require('../constants/onboardingStates');

class UserOnboardingService {
  #storage;

  #formatter;

  #namePolicyService;

  #loungeValidationService;

  constructor(storage, formatter, namePolicyService, loungeValidationService) {
    this.#storage = storage;
    this.#formatter = formatter;
    this.#namePolicyService = namePolicyService;
    this.#loungeValidationService = loungeValidationService;
  }

  beginOnboardingForChat(chatId) {
    this.#storage.saveByChatId(chatId, { step: states.WAITING_NAME });
    return ['Привет! Я VIP-бот хоккейного клуба «Автомобилист» 🏒', 'Помогу с сервисом в ложу, мерчем и всем, что нужно по матчу «Автомобилист» vs «Адмирал».', `Давайте быстро зарегистрируемся:\n${this.#formatter.formatBold('Как вас зовут')}?`];
  }

  handleOnboardingReply(chatId, inputText) {
    const session = this.#storage.getByChatId(chatId);
    if (!session || !session.step) return { messages: this.beginOnboardingForChat(chatId) };
    if (session.step === states.WAITING_NAME) return this.#handleNameStep(chatId, inputText);
    if (session.step === states.WAITING_LOUNGE) return this.#handleLoungeStep(chatId, inputText, session.name);
    return { messages: ['Вы уже зарегистрированы. Для перезапуска отправьте /start.'] };
  }

  #handleNameStep(chatId, rawName) {
    const validationError = this.#namePolicyService.validateGuestName(rawName);
    if (validationError) return { messages: [validationError, `${this.#formatter.formatBold('Как вас зовут')}?`] };
    const name = rawName.trim();
    this.#storage.saveByChatId(chatId, { step: states.WAITING_LOUNGE, name });
    return { messages: [`Отлично, ${this.#formatter.formatBold(name)}! 👋\nРады видеть вас в VIP.`, 'Введите номер вашей VIP-ложи:\n• просто цифру от 1 до 44 (например: 3)\n• или в формате VIP 3'] };
  }

  #handleLoungeStep(chatId, rawLounge, name) {
    const loungeValidation = this.#loungeValidationService.validateAndNormalizeLounge(rawLounge);
    if (loungeValidation.error) return { messages: [loungeValidation.error] };
    this.#storage.saveByChatId(chatId, { step: states.COMPLETED, lounge: loungeValidation.value });
    return { messages: [`Принято! ${this.#formatter.formatBold(name)}, ложа: ${this.#formatter.formatBold(loungeValidation.value)}.`], completedProfile: { name, lounge: loungeValidation.value } };
  }
}

module.exports = UserOnboardingService;
