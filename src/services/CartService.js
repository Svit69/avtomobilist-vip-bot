class CartService {
  #cartRepository;
  #productRepository;

  constructor(cartRepository, productRepository) { this.#cartRepository = cartRepository; this.#productRepository = productRepository; }
  getCartItems(chatId) { return this.#cartRepository.getCartByChatId(chatId).items; }

  addProduct(chatId, productId) {
    const product = this.#productRepository.getProductById(productId);
    if (!product) return { code: 'NOT_FOUND' };
    if (product.quantity <= 0) return { code: 'OUT_OF_STOCK' };
    const cart = this.#cartRepository.getCartByChatId(chatId);
    const index = cart.items.findIndex(item => item.productId === productId);
    const nextQty = index >= 0 ? cart.items[index].quantity + 1 : 1;
    if (nextQty > product.quantity) return { code: 'LIMIT', product };
    if (index >= 0) cart.items[index].quantity = nextQty;
    if (index < 0) cart.items.push({ productId, title: product.title, priceFrom: product.priceFrom, quantity: 1 });
    this.#cartRepository.saveCart(chatId, cart.items);
    return { code: 'OK', product };
  }

  buildCartPayload(chatId) {
    const cart = this.#cartRepository.getCartByChatId(chatId);
    if (!cart.items.length) return { text: 'Ваша корзина пока пуста.' };
    const lines = cart.items.map((item, i) => `${i + 1}. ${item.title} (${item.quantity} шт) — от ${new Intl.NumberFormat('ru-RU').format(item.priceFrom)} ₽`);
    const total = cart.items.reduce((sum, item) => sum + item.priceFrom * item.quantity, 0);
    return { text: `Ваши покупки:\n${lines.join('\n')}\n\nОбщая сумма: от ${new Intl.NumberFormat('ru-RU').format(total)} ₽\n\nЕсли хотите удалить предметы из корзины, нажмите /delete`, replyMarkup: { inline_keyboard: [[{ text: 'заказать', callback_data: 'checkout_cart' }]] } };
  }

  removeItemByIndex(chatId, index) { const cart = this.#cartRepository.getCartByChatId(chatId); if (index < 0 || index >= cart.items.length) return null; const [removed] = cart.items.splice(index, 1); this.#cartRepository.saveCart(chatId, cart.items); return removed; }
  removeAll(chatId) { this.#cartRepository.saveCart(chatId, []); }

  checkout(chatId) {
    const cart = this.#cartRepository.getCartByChatId(chatId);
    if (!cart.items.length) return { error: 'Корзина пуста.' };
    const stock = this.#productRepository.decreaseQuantities(cart.items);
    if (stock.error) return { error: stock.error };
    const items = cart.items.map(item => ({ title: item.title, quantity: item.quantity, priceFrom: item.priceFrom }));
    const total = cart.items.reduce((sum, item) => sum + item.priceFrom * item.quantity, 0);
    this.#cartRepository.saveCart(chatId, []);
    return { items, total };
  }
}

module.exports = CartService;
