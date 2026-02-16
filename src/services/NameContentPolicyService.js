const prohibitedFragments = require('../constants/prohibitedNameFragments');

class NameContentPolicyService {
  validateGuestName(rawName) {
    const name = String(rawName || '').trim();
    if (!name) return 'Пожалуйста, укажите имя.';
    if (name.length < 2) return 'Имя слишком короткое. Укажите минимум 2 символа.';
    const loweredName = name.toLowerCase();
    const hasForbiddenFragment = prohibitedFragments.some(fragment => loweredName.includes(fragment));
    if (hasForbiddenFragment) return 'Пожалуйста, используйте корректное имя без нецензурных слов.';
    return null;
  }
}

module.exports = NameContentPolicyService;
