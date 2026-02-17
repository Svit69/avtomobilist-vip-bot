class CartRepository {
  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  getCartByChatId(chatId) {
    return this.#repository.readAll().find(item => item.chatId === chatId) || { chatId, items: [] };
  }

  saveCart(chatId, items) {
    const all = this.#repository.readAll();
    const index = all.findIndex(item => item.chatId === chatId);
    const cart = { chatId, items };
    if (index >= 0) all[index] = cart;
    if (index < 0) all.push(cart);
    this.#repository.writeAll(all);
  }
}

module.exports = CartRepository;
