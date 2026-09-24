export const JPDB_LANGUAGE_MESSAGE = 'JPDB_LANGUAGE';
export const JPDB_LANGUAGE_CHANGED_MESSAGE = 'JPDB_LANGUAGE_CHANGED';
export const JPDB_LANGUAGE_STORAGE_KEY = 'jpdb-language';

export const JPDB_EMBED_SURFACES = Object.freeze({
  organizer: Object.freeze({ elementId: '#organizerEmbed', status: 'known' }),
  playerProfile: Object.freeze({ elementId: '#playerProfileEmbed', status: 'known' }),
  eventCards: Object.freeze({ elementId: null, status: 'editor-id-required' }),
  causes: Object.freeze({ elementId: null, status: 'editor-id-required' }),
  admin: Object.freeze({ elementId: null, status: 'editor-id-required' }),
  jobs: Object.freeze({ elementId: null, status: 'editor-id-required' }),
  donations: Object.freeze({ elementId: null, status: 'editor-id-required' })
});

export function isJpdbLanguage(value) {
  return value === 'fr' || value === 'en';
}

export function normalizeJpdbLanguage(value, fallback = 'fr') {
  if (isJpdbLanguage(value)) return value;
  return fallback === 'en' ? 'en' : 'fr';
}

export function jpdbLocale(language) {
  return normalizeJpdbLanguage(language) === 'en' ? 'en-CA' : 'fr-CA';
}

export function readJpdbLanguageFromUrl(urlValue) {
  if (!urlValue) return null;

  try {
    const url = new URL(String(urlValue), 'https://jpdb.invalid');
    const language = url.searchParams.get('lang');
    return isJpdbLanguage(language) ? language : null;
  } catch {
    return null;
  }
}

export function withJpdbLanguage(urlValue, language) {
  const input = String(urlValue || '');
  const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(input);
  const isProtocolRelative = input.startsWith('//');
  const url = new URL(input, 'https://jpdb.invalid');
  url.searchParams.set('lang', normalizeJpdbLanguage(language));

  if (isAbsolute) return url.toString();
  if (isProtocolRelative) return `//${url.host}${url.pathname}${url.search}${url.hash}`;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function readStoredJpdbLanguage(storage) {
  try {
    const language = storage?.getItem?.(JPDB_LANGUAGE_STORAGE_KEY);
    return isJpdbLanguage(language) ? language : null;
  } catch {
    return null;
  }
}

export function storeJpdbLanguage(storage, language) {
  try {
    storage?.setItem?.(
      JPDB_LANGUAGE_STORAGE_KEY,
      normalizeJpdbLanguage(language)
    );
    return Boolean(storage?.setItem);
  } catch {
    return false;
  }
}

export function resolveJpdbLanguage({ urlValue, storage, fallback = 'fr' } = {}) {
  return normalizeJpdbLanguage(
    readStoredJpdbLanguage(storage) || readJpdbLanguageFromUrl(urlValue),
    fallback
  );
}

export function getJpdbOrigin(urlValue) {
  if (!urlValue) return null;

  try {
    return new URL(String(urlValue)).origin;
  } catch {
    return null;
  }
}

export function isAllowedJpdbMessageOrigin(
  messageEvent,
  { allowedOrigins = [], allowMissingOrigin = false } = {}
) {
  const origins = allowedOrigins.filter(Boolean);
  if (origins.length === 0) return true;

  const origin = messageEvent?.origin;
  if (!origin) return allowMissingOrigin;
  return origins.includes(origin);
}

const lastLanguageByComponent = new WeakMap();

export function sendJpdbLanguage(htmlComponent, language, { force = false } = {}) {
  if (!htmlComponent || typeof htmlComponent.postMessage !== 'function') return false;

  const normalized = normalizeJpdbLanguage(language);
  if (!force && lastLanguageByComponent.get(htmlComponent) === normalized) return false;

  htmlComponent.postMessage({
    type: JPDB_LANGUAGE_MESSAGE,
    language: normalized
  });
  lastLanguageByComponent.set(htmlComponent, normalized);
  return true;
}

export function readJpdbLanguageChange(messageEvent, originOptions) {
  if (!isAllowedJpdbMessageOrigin(messageEvent, originOptions)) return null;

  const message = messageEvent?.data;
  if (message?.type !== JPDB_LANGUAGE_CHANGED_MESSAGE) return null;
  return isJpdbLanguage(message.language) ? message.language : null;
}

export function registerJpdbEmbedLanguage({
  htmlComponent,
  getLanguage,
  onLanguageChange,
  allowedOrigins = [],
  allowMissingOrigin = true
}) {
  if (!htmlComponent || typeof htmlComponent.onMessage !== 'function') {
    return { send: () => false };
  }

  htmlComponent.onMessage((event) => {
    if (event?.data?.type === 'JPDB_LANGUAGE_READY' &&
        isAllowedJpdbMessageOrigin(event, { allowedOrigins, allowMissingOrigin })) {
      sendJpdbLanguage(htmlComponent, getLanguage?.(), { force: true });
      return;
    }
    const language = readJpdbLanguageChange(event, {
      allowedOrigins,
      allowMissingOrigin
    });

    if (!language || language === normalizeJpdbLanguage(getLanguage?.())) return;
    onLanguageChange?.(language, { source: 'embed' });
  });

  return {
    send(language, options) {
      return sendJpdbLanguage(htmlComponent, language, options);
    }
  };
}

export function createJpdbLanguageCoordinator({
  initialLanguage = 'fr',
  storage,
  embeds = [],
  onLanguageChange
} = {}) {
  let language = normalizeJpdbLanguage(initialLanguage);
  const bridges = [];
  const registered = new WeakSet();
  const listeners = new Set();
  function addEmbed(embed) {
    if (!embed?.htmlComponent || registered.has(embed.htmlComponent)) return;
    registered.add(embed.htmlComponent);
    const bridge = registerJpdbEmbedLanguage({
      ...embed,
      getLanguage: () => language,
      onLanguageChange: (next) => setLanguage(next, { source: 'embed' })
    });
    bridges.push(bridge);
    bridge.send(language, { force: true });
  }
  embeds.forEach(addEmbed);
  storeJpdbLanguage(storage, language);

  function broadcast({ force = false } = {}) {
    bridges.forEach((bridge) => bridge.send(language, { force }));
  }

  function setLanguage(nextLanguage, { source = 'host', force = false } = {}) {
    if (!isJpdbLanguage(nextLanguage)) return false;
    const normalized = nextLanguage;
    const changed = normalized !== language;
    if (!changed && !force) return false;

    language = normalized;
    storeJpdbLanguage(storage, language);
    onLanguageChange?.(language, { source, changed });
    listeners.forEach(listener => listener(language, { source, changed }));
    broadcast({ force });
    return true;
  }

  return Object.freeze({
    getLanguage: () => language,
    setLanguage,
    addEmbed,
    subscribe(listener) {
      listeners.add(listener);
      listener(language, { source: 'initial', changed: false });
      return () => listeners.delete(listener);
    },
    broadcast
  });
}

let sharedCoordinator;
export function getSharedJpdbLanguageCoordinator({ urlValue, storage, embeds = [] } = {}) {
  if (!sharedCoordinator) {
    sharedCoordinator = createJpdbLanguageCoordinator({
      initialLanguage: resolveJpdbLanguage({ urlValue, storage }), storage, embeds
    });
  } else {
    embeds.forEach(embed => sharedCoordinator.addEmbed(embed));
  }
  return sharedCoordinator;
}
