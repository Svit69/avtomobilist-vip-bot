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

  buildCartText(chatId) {
    const cart = this.#cartRepository.getCartByChatId(chatId);
    if (!cart.items.length) return 'Ваша корзина пока пуста.';
    const lines = cart.items.map((item, i) => `${i + 1}. ${item.title} x${item.quantity} — от ${item.priceFrom} ₽`);
    return `Ваши покупки:\n${lines.join('\n')}`;
  }
}

module.exports = CartService;
