class VipGuestMenuService {
  #formatter;

  constructor(formatter) {
    this.#formatter = formatter;
  }

  buildCharityMerchOffer(profile, isAdmin) {
    const loungeNumber = this.#extractLoungeNumber(profile.lounge);
    const guestName = this.#formatter.formatBold(profile.name);
    const vipLounge = this.#formatter.formatBold(`VIP-${loungeNumber}`);
    const keyboard = [[{ text: 'Благотворительный мерч' }, { text: 'Корзина' }], ...(isAdmin ? [[{ text: '/admin' }]] : [])];
    const text = `Рады видеть вас на матче, ${guestName}, ложа ${vipLounge}!\n\nСегодняшняя игра — благотворительная 🎗\nВместе с фондом мы поддерживаем детей, которые борются с онкологией.\n\nДля гостей VIP мы подготовили лимитированную коллекцию матча — часть средств с каждой Корзина направляется на помощь детям.\n\nЧто хотите посмотреть? 👇`;
    return { text, replyMarkup: { keyboard, resize_keyboard: true, is_persistent: true } };
  }

  #extractLoungeNumber(rawLounge) {
    const match = String(rawLounge || '').match(/(\d{1,2})/);
    return match ? Number(match[1]) : rawLounge;
  }
}

module.exports = VipGuestMenuService;
