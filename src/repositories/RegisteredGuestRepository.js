class RegisteredGuestRepository {
  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  saveOrUpdateGuest(chatId, profile) {
    const items = this.#repository.readAll();
    const index = items.findIndex(item => item.chatId === chatId);
    const next = { chatId, name: profile.name, lounge: profile.lounge, orderedProduct: profile.orderedProduct || '' };
    if (index >= 0) items[index] = { ...items[index], ...next };
    if (index < 0) items.push(next);
    this.#repository.writeAll(items);
  }

  saveOrderedProduct(chatId, orderedProduct) {
    const items = this.#repository.readAll();
    const index = items.findIndex(item => item.chatId === chatId);
    if (index < 0) return;
    items[index] = { ...items[index], orderedProduct };
    this.#repository.writeAll(items);
  }

  getGuestByChatId(chatId) {
    return this.#repository.readAll().find(item => item.chatId === chatId) || null;
  }

  getAllGuests() {
    return this.#repository.readAll();
  }
}

module.exports = RegisteredGuestRepository;
