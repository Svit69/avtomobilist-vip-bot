const AbstractMessageFormatter = require('./AbstractMessageFormatter');

class TelegramHtmlFormatter extends AbstractMessageFormatter {
  formatBold(text) {
    return `<b>${this.#escapeHtml(text)}</b>`;
  }

  #escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

module.exports = TelegramHtmlFormatter;
