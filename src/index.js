const path = require('path');
require('dotenv').config();

const EnvironmentConfig = require('./config/EnvironmentConfig');
const InMemorySessionStorage = require('./core/InMemorySessionStorage');
const JsonFileRepository = require('./repositories/JsonFileRepository');
const RegisteredGuestRepository = require('./repositories/RegisteredGuestRepository');
const ProductCatalogRepository = require('./repositories/ProductCatalogRepository');
const TelegramHtmlFormatter = require('./formatters/TelegramHtmlFormatter');
const NameContentPolicyService = require('./services/NameContentPolicyService');
const LoungeFormatValidationService = require('./services/LoungeFormatValidationService');
const UserOnboardingService = require('./services/UserOnboardingService');
const VipGuestMenuService = require('./services/VipGuestMenuService');
const RegisteredGuestService = require('./services/RegisteredGuestService');
const ProductCatalogAdminService = require('./services/ProductCatalogAdminService');
const ProductCatalogGuestService = require('./services/ProductCatalogGuestService');
const GuestCatalogDeliveryService = require('./services/GuestCatalogDeliveryService');
const AdminProductPayloadParser = require('./services/AdminProductPayloadParser');
const AdminCommandService = require('./services/AdminCommandService');
const VipTelegramBot = require('./bot/VipTelegramBot');

const config = new EnvironmentConfig(process.env);
const formatter = new TelegramHtmlFormatter();
const usersRepo = new RegisteredGuestRepository(new JsonFileRepository(path.join(__dirname, '../data/users.json')));
const productsRepo = new ProductCatalogRepository(new JsonFileRepository(path.join(__dirname, '../data/products.json')));
const onboardingService = new UserOnboardingService(new InMemorySessionStorage(), formatter, new NameContentPolicyService(), new LoungeFormatValidationService());
const guestMenuService = new VipGuestMenuService(formatter);
const guestRegistryService = new RegisteredGuestService(usersRepo);
const productService = new ProductCatalogAdminService(productsRepo);
const adminCommandService = new AdminCommandService(config.getAdminId(), guestRegistryService, productService, new AdminProductPayloadParser());
const catalogDelivery = new GuestCatalogDeliveryService(new ProductCatalogGuestService(productsRepo, formatter));
const bot = new VipTelegramBot(config.getBotToken(), onboardingService, guestMenuService, guestRegistryService, adminCommandService, catalogDelivery, config.getAdminId());

bot.startPolling();
