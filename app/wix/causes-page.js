// Page code for /causes. Add one HTML component with ID causesEmbed.
// Reuses the existing site's API and language helpers; no new secret is needed.
import { listPublicCauses } from 'backend/causes.web';
import wixLocationFrontend from 'wix-location-frontend';
import { local } from 'wix-storage-frontend';
import { jpdbLocale, getSharedJpdbLanguageCoordinator } from 'public/jpdb-language';
import { createCausesResponder } from 'public/causes-bridge';

$w.onReady(() => {
  const embed = $w('#causesEmbed');
  const language = getSharedJpdbLanguageCoordinator({ urlValue: wixLocationFrontend.url, storage: local });
  language.addEmbed({ htmlComponent: embed });
  const respond = createCausesResponder({
    load: lang => listPublicCauses(jpdbLocale(lang)),
    send: message => embed.postMessage(message),
    getLanguage: () => language.getLanguage()
  });
  embed.onMessage(event => { void respond(event.data); });
});
