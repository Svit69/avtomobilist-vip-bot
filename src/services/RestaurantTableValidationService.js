class RestaurantTableValidationService {
  validateAndNormalizeTable(rawValue) {
    const value = String(rawValue || '').trim();
    const number = Number(value);
    if (!value) return { error: 'Пожалуйста, укажите номер вашего стола в ресторане.' };
    if (!Number.isInteger(number) || number < 1 || number > 25) {
      return { error: 'Номер стола в ресторане должен быть целым числом от 1 до 25.' };
    }
    return { value: String(number) };
  }
}

module.exports = RestaurantTableValidationService;
