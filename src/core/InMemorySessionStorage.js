const AbstractSessionStorage = require('./AbstractSessionStorage');

class InMemorySessionStorage extends AbstractSessionStorage {
  #sessions = new Map();

  getByChatId(chatId) {
    return this.#sessions.get(chatId) || null;
  }

  saveByChatId(chatId, payload) {
    const current = this.getByChatId(chatId) || {};
    this.#sessions.set(chatId, { ...current, ...payload });
    return this.getByChatId(chatId);
  }
}

module.exports = InMemorySessionStorage;
