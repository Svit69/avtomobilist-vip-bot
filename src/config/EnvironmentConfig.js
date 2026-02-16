class EnvironmentConfig {
  #botToken;

  #adminId;

  constructor(env) {
    this.#botToken = env.BOT_TOKEN;
    this.#adminId = Number(env.ADMIN_ID);
    this.#validateRequiredConfig();
  }

  getBotToken() {
    return this.#botToken;
  }

  getAdminId() {
    return this.#adminId;
  }

  #validateRequiredConfig() {
    if (!this.#botToken) throw new Error('BOT_TOKEN is required in .env');
    if (!Number.isInteger(this.#adminId)) {
      throw new Error('ADMIN_ID must be a valid integer in .env');
    }
  }
}

module.exports = EnvironmentConfig;
