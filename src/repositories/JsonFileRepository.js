const fs = require('fs');

class JsonFileRepository {
  #filePath;

  constructor(filePath) {
    this.#filePath = filePath;
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf8');
  }

  readAll() {
    const raw = fs.readFileSync(this.#filePath, 'utf8') || '[]';
    const content = this.#stripUtf8Bom(raw).trim() || '[]';
    return JSON.parse(content);
  }

  writeAll(items) {
    fs.writeFileSync(this.#filePath, JSON.stringify(items, null, 2), 'utf8');
  }

  #stripUtf8Bom(content) {
    return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
  }
}

module.exports = JsonFileRepository;
