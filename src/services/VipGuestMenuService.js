class VipGuestMenuService {
  buildCharityMerchOffer(profile, isAdmin) {
    const keyboard = [[{ text: 'Благотворительный мерч' }, { text: 'Корзина' }], ...(isAdmin ? [[{ text: '/admin' }]] : [])];
    const text = `Сегодняшняя игра — благотворительная 🎗\nВместе с фондом «Дети России» мы поддерживаем детей, которые борются с онкологией.\n\nДля гостей VIP мы подготовили лимитированную коллекцию атрибутики, средства с продажи которой будут направлены на помощь детям.\n\nЧто хотите посмотреть?`;
    return { text, replyMarkup: { keyboard, resize_keyboard: true, is_persistent: true } };
  }
}

module.exports = VipGuestMenuService;
