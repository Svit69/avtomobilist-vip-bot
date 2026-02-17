const path = require('path');
require('dotenv').config();

const EnvironmentConfig = require('./config/EnvironmentConfig');
const FileSessionStorage = require('./core/FileSessionStorage');
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
const AdminPanelService = require('./services/AdminPanelService');
const AdminProductDialogService = require('./services/AdminProductDialogService');
const VipTelegramBot = require('./bot/VipTelegramBot');

const config = new EnvironmentConfig(process.env);
const formatter = new TelegramHtmlFormatter();
const usersRepo = new RegisteredGuestRepository(new JsonFileRepository(path.join(__dirname, '../data/users.json')));
const productsRepo = new ProductCatalogRepository(new JsonFileRepository(path.join(__dirname, '../data/products.json')));
const sessionStorage = new FileSessionStorage(new JsonFileRepository(path.join(__dirname, '../data/sessions.json')));
const onboardingService = new UserOnboardingService(sessionStorage, formatter, new NameContentPolicyService(), new LoungeFormatValidationService());
const guestMenuService = new VipGuestMenuService(formatter);
const guestRegistryService = new RegisteredGuestService(usersRepo);
const productService = new ProductCatalogAdminService(productsRepo);
const adminDialog = new AdminProductDialogService(config.getAdminId(), sessionStorage, productService);
const adminCommands = new AdminCommandService(config.getAdminId(), guestRegistryService, productService, new AdminProductPayloadParser(), new AdminPanelService(), adminDialog);
const catalogDelivery = new GuestCatalogDeliveryService(new ProductCatalogGuestService(productsRepo, formatter));
const bot = new VipTelegramBot(config.getBotToken(), onboardingService, guestMenuService, guestRegistryService, adminCommands, adminDialog, catalogDelivery, config.getAdminId());

bot.startPolling();
