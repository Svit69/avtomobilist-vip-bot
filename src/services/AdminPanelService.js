class AdminPanelService {
  buildPanelResponse() {
    return {
      text: 'Админ-панель готова. Выберите действие кнопкой ниже.',
      replyMarkup: {
        keyboard: [[{ text: '/admin_users' }, { text: '/admin_products' }], [{ text: '/admin_product_add' }, { text: '/admin_help' }], [{ text: '/menu' }]],
        resize_keyboard: true,
        is_persistent: true
      }
    };
  }
}

module.exports = AdminPanelService;
