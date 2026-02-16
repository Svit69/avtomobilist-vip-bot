class AbstractSessionStorage {
  getByChatId() {
    throw new Error('getByChatId must be implemented');
  }

  saveByChatId() {
    throw new Error('saveByChatId must be implemented');
  }
}

module.exports = AbstractSessionStorage;
