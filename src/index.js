require('dotenv').config();

const EnvironmentConfig = require('./config/EnvironmentConfig');
const InMemorySessionStorage = require('./core/InMemorySessionStorage');
const TelegramHtmlFormatter = require('./formatters/TelegramHtmlFormatter');
const NameContentPolicyService = require('./services/NameContentPolicyService');
const LoungeFormatValidationService = require('./services/LoungeFormatValidationService');
const UserOnboardingService = require('./services/UserOnboardingService');
const VipGuestMenuService = require('./services/VipGuestMenuService');
const VipTelegramBot = require('./bot/VipTelegramBot');

const config = new EnvironmentConfig(process.env);
const storage = new InMemorySessionStorage();
const formatter = new TelegramHtmlFormatter();
const namePolicyService = new NameContentPolicyService();
const loungeValidationService = new LoungeFormatValidationService();
const onboardingService = new UserOnboardingService(storage, formatter, namePolicyService, loungeValidationService);
const guestMenuService = new VipGuestMenuService(formatter);
const bot = new VipTelegramBot(config.getBotToken(), onboardingService, guestMenuService, config.getAdminId());

bot.startPolling();
