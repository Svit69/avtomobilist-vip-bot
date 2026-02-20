class RegisteredGuestService {
  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  saveRegistration(chatId, profile) {
    this.#repository.saveOrUpdateGuest(chatId, profile);
  }

  saveOrderedProduct(chatId, orderedProduct) {
    this.#repository.saveOrderedProduct(chatId, orderedProduct);
  }

  getGuestByChatId(chatId) {
    return this.#repository.getGuestByChatId(chatId);
  }

  getAllGuestChatIds() {
    return [...new Set(this.#repository.getAllGuests().map(guest => guest.chatId))];
  }

  buildAdminGuestsReport() {
    const guests = this.#repository.getAllGuests();
    if (!guests.length) return 'Пока нет зарегистрированных пользователей.';
    return guests
      .map((guest, index) => `${index + 1}. ${guest.name} | Ложа: ${guest.lounge} | Товар: ${guest.orderedProduct || 'не заказан'}`)
      .join('\n');
  }
}

module.exports = RegisteredGuestService;
