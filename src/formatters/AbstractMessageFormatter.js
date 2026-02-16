class AbstractMessageFormatter {
  formatBold() {
    throw new Error('formatBold must be implemented');
  }
}

module.exports = AbstractMessageFormatter;
