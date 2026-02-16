class VipGuestMenuService {
  buildCharityMerchOffer(profile) {
    const loungeNumber = this.#extractLoungeNumber(profile.lounge);
    const text = `Рады видеть вас на матче, ${profile.name}, ложа VIP-${loungeNumber}!\n\nСегодняшняя игра — благотворительная 🎗\nВместе с фондом мы поддерживаем детей, которые борются с онкологией.\n\nДля гостей VIP мы подготовили лимитированную коллекцию матча — часть средств с каждой покупки направляется на помощь детям.\n\nЧто хотите посмотреть? 👇`;
    return {
      text,
      replyMarkup: {
        inline_keyboard: [[{ text: 'Благотворительный мерч', callback_data: 'charity_merch' }]]
      }
    };
  }

  #extractLoungeNumber(rawLounge) {
    const match = String(rawLounge || '').match(/(\d{1,2})/);
    return match ? Number(match[1]) : rawLounge;
  }
}

module.exports = VipGuestMenuService;
