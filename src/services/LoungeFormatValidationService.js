class LoungeFormatValidationService {
  validateAndNormalizeLounge(rawLounge) {
    const value = String(rawLounge || '').trim();
    if (!value) return { error: 'Пожалуйста, укажите номер VIP-ложи.' };
    const directNumberMatch = value.match(/^(\d{1,2})$/);
    if (directNumberMatch) return this.#normalizeLoungeByNumber(directNumberMatch[1]);
    const vipNumberMatch = value.match(/^vip\s*(\d{1,2})$/i);
    if (vipNumberMatch) return this.#normalizeVipLounge(vipNumberMatch[1]);
    return { error: 'Формат ложи: число от 1 до 44 или VIP <число> (например: 3 или VIP 3).' };
  }

  #normalizeLoungeByNumber(numberText) {
    const number = Number(numberText);
    if (number < 1 || number > 44) return { error: 'Номер VIP-ложи должен быть в диапазоне от 1 до 44.' };
    return { value: String(number) };
  }

  #normalizeVipLounge(numberText) {
    const normalized = this.#normalizeLoungeByNumber(numberText);
    if (normalized.error) return normalized;
    return { value: `VIP ${normalized.value}` };
  }
}

module.exports = LoungeFormatValidationService;
