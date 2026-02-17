const fs = require('fs');

class JsonFileRepository {
  #filePath;

  constructor(filePath) {
    this.#filePath = filePath;
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf8');
  }

  readAll() {
    const content = fs.readFileSync(this.#filePath, 'utf8') || '[]';
    return JSON.parse(content);
  }

  writeAll(items) {
    fs.writeFileSync(this.#filePath, JSON.stringify(items, null, 2), 'utf8');
  }
}

module.exports = JsonFileRepository;
