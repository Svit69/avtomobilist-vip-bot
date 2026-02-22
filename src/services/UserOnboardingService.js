const states = require('../constants/onboardingStates');

class UserOnboardingService {
  #storage; #formatter; #namePolicyService; #loungeValidationService; #restaurantTableValidationService;
  constructor(storage, formatter, namePolicyService, loungeValidationService, restaurantTableValidationService) { this.#storage = storage; this.#formatter = formatter; this.#namePolicyService = namePolicyService; this.#loungeValidationService = loungeValidationService; this.#restaurantTableValidationService = restaurantTableValidationService; }

  beginOnboardingForChat(chatId) { this.#storage.saveByChatId(chatId, { step: states.WAITING_NAME }); return ['Привет! Я VIP-бот хоккейного клуба «Автомобилист» 🏒', 'С моей помощью вы можете заказать благотворительный мерч на матче «Автомобилист» vs «Адмирал».', `Давайте быстро зарегистрируемся:\n${this.#formatter.formatBold('Как вас зовут')}?`]; }

  handleOnboardingReply(chatId, inputText) {
    const s = this.#storage.getByChatId(chatId); if (!s || !s.step) return { messages: this.beginOnboardingForChat(chatId) };
    if (s.step === states.WAITING_NAME) return this.#handleName(chatId, inputText);
    if (s.step === states.WAITING_LOCATION_TYPE) return this.#handleLocationType(chatId, inputText, s.name);
    if (s.step === states.WAITING_LOUNGE) return this.#handleLounge(chatId, inputText, s.name);
    if (s.step === states.WAITING_RESTAURANT_TABLE) return this.#handleRestaurant(chatId, inputText, s.name);
    return { messages: ['Для связи с администратором напишите @ol_svit'] };
  }

  #handleName(chatId, raw) { const e = this.#namePolicyService.validateGuestName(raw); if (e) return { messages: [e, `${this.#formatter.formatBold('Как вас зовут')}?`] }; const name = raw.trim(); this.#storage.saveByChatId(chatId, { step: states.WAITING_LOCATION_TYPE, name }); return { messages: [`Отлично, ${this.#formatter.formatBold(name)}! 👋\nРады приветствовать вас среди VIP-гостей.`, { text: 'Пожалуйста, уточните, где вы находитесь:', replyMarkup: { keyboard: [[{ text: 'VIP-ложа' }, { text: 'Ресторан' }]], resize_keyboard: true, one_time_keyboard: true } }] }; }
  #handleLocationType(chatId, raw, name) { const v = String(raw || '').trim().toLowerCase(); if (v === 'vip-ложа' || v === 'vip ложа' || v === 'ложа') { this.#storage.saveByChatId(chatId, { step: states.WAITING_LOUNGE, locationType: 'VIP_LOUNGE' }); return { messages: [{ text: 'Введите номер вашей VIP-ложи:\n• просто цифру от 1 до 44 (например: 3)\n• или в формате VIP 3', replyMarkup: { remove_keyboard: true } }] }; } if (v === 'ресторан') { this.#storage.saveByChatId(chatId, { step: states.WAITING_RESTAURANT_TABLE, locationType: 'RESTAURANT' }); return { messages: [{ text: 'Подскажите, пожалуйста, номер вашего стола в ресторане (от 1 до 25).', replyMarkup: { remove_keyboard: true } }] }; } return { messages: ['Пожалуйста, выберите один из вариантов с помощью кнопок: VIP-ложа или Ресторан.'] }; }
  #handleLounge(chatId, raw, name) { const r = this.#loungeValidationService.validateAndNormalizeLounge(raw); if (r.error) return { messages: [r.error] }; this.#storage.saveByChatId(chatId, { step: states.COMPLETED, lounge: r.value }); return { messages: [], completedProfile: { name, lounge: r.value } }; }
  #handleRestaurant(chatId, raw, name) { const r = this.#restaurantTableValidationService.validateAndNormalizeTable(raw); if (r.error) return { messages: [r.error] }; const location = `Ресторан, стол ${r.value}`; this.#storage.saveByChatId(chatId, { step: states.COMPLETED, lounge: location }); return { messages: [], completedProfile: { name, lounge: location } }; }
}

module.exports = UserOnboardingService;
