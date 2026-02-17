class AdminProductPayloadParser {
  parseProductPayload(payloadText) {
    const parts = String(payloadText || '').split('|').map(part => part.trim());
    if (parts.length !== 4) return { error: 'Формат: Название | Описание | Цена от | Фото1, Фото2' };
    const [title, description, priceFromText, photosText] = parts;
    const priceFrom = Number(priceFromText);
    if (!title || !description) return { error: 'Название и описание обязательны.' };
    if (!Number.isFinite(priceFrom) || priceFrom <= 0) return { error: 'Цена должна быть числом больше 0.' };
    const photos = photosText.split(',').map(photo => photo.trim()).filter(Boolean);
    if (!photos.length) return { error: 'Добавьте хотя бы одну ссылку на фото.' };
    return { value: { title, description, priceFrom, photos } };
  }

  parseEditPayload(payloadText) {
    const [idText, ...rest] = String(payloadText || '').split('|').map(item => item.trim());
    const id = Number(idText);
    if (!Number.isInteger(id) || id <= 0) return { error: 'Укажите корректный id карточки.' };
    const parsed = this.parseProductPayload(rest.join(' | '));
    if (parsed.error) return parsed;
    return { value: { id, payload: parsed.value } };
  }
}

module.exports = AdminProductPayloadParser;
