require('dotenv').config();

const EnvironmentConfig = require('./config/EnvironmentConfig');
const InMemorySessionStorage = require('./core/InMemorySessionStorage');
const TelegramHtmlFormatter = require('./formatters/TelegramHtmlFormatter');
const UserOnboardingService = require('./services/UserOnboardingService');
const VipTelegramBot = require('./bot/VipTelegramBot');

const config = new EnvironmentConfig(process.env);
const storage = new InMemorySessionStorage();
const formatter = new TelegramHtmlFormatter();
const onboardingService = new UserOnboardingService(storage, formatter);
const bot = new VipTelegramBot(config.getBotToken(), onboardingService, config.getAdminId());

bot.startPolling();
