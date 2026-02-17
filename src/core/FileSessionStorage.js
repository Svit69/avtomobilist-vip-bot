const AbstractSessionStorage = require('./AbstractSessionStorage');

class FileSessionStorage extends AbstractSessionStorage {
  #repository;

  constructor(repository) {
    super();
    this.#repository = repository;
  }

  getByChatId(chatId) {
    const items = this.#repository.readAll();
    return items.find(item => item.chatId === chatId) || null;
  }

  saveByChatId(chatId, payload) {
    const items = this.#repository.readAll();
    const index = items.findIndex(item => item.chatId === chatId);
    const current = index >= 0 ? items[index] : { chatId };
    const next = { ...current, ...payload, chatId };
    if (index >= 0) items[index] = next;
    if (index < 0) items.push(next);
    this.#repository.writeAll(items);
    return next;
  }
}

module.exports = FileSessionStorage;
