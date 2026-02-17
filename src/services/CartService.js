class CartService {
  #cartRepository;
  #productRepository;

  constructor(cartRepository, productRepository) {
    this.#cartRepository = cartRepository;
    this.#productRepository = productRepository;
  }

  addProduct(chatId, productId) {
    const product = this.#productRepository.getProductById(productId);
    if (!product) return null;
    const cart = this.#cartRepository.getCartByChatId(chatId);
    const index = cart.items.findIndex(item => item.productId === productId);
    if (index >= 0) cart.items[index].quantity += 1;
    if (index < 0) cart.items.push({ productId, title: product.title, priceFrom: product.priceFrom, quantity: 1 });
    this.#cartRepository.saveCart(chatId, cart.items);
    return product;
  }

  buildCartPayload(chatId) {
    const cart = this.#cartRepository.getCartByChatId(chatId);
    if (!cart.items.length) return { text: 'Ваша корзина пока пуста.' };
    const lines = cart.items.map((item, i) => `${i + 1}. ${item.title} (${item.quantity} шт) — от ${item.priceFrom} ₽`);
    const total = cart.items.reduce((sum, item) => sum + item.priceFrom * item.quantity, 0);
    return { text: `Ваши покупки:\n${lines.join('\n')}\n\nОбщая сумма: от ${total} ₽`, replyMarkup: { inline_keyboard: [[{ text: 'заказать', callback_data: 'checkout_cart' }]] } };
  }

  checkout(chatId) {
    const cart = this.#cartRepository.getCartByChatId(chatId);
    if (!cart.items.length) return null;
    const items = cart.items.map(item => ({ title: item.title, quantity: item.quantity, priceFrom: item.priceFrom }));
    const total = cart.items.reduce((sum, item) => sum + item.priceFrom * item.quantity, 0);
    this.#cartRepository.saveCart(chatId, []);
    return { items, total };
  }
}

module.exports = CartService;
