// Optional site-wide language sync only. Data loads directly from Supabase.
// Add one HTML component named causesEmbed and use the hosted production URL.
import wixLocationFrontend from 'wix-location-frontend';
import { local } from 'wix-storage-frontend';
import { getSharedJpdbLanguageCoordinator } from 'public/jpdb-language';
$w.onReady(() => {
 const language = getSharedJpdbLanguageCoordinator({ urlValue:wixLocationFrontend.url, storage:local });
 language.addEmbed({ htmlComponent:$w('#causesEmbed') });
});
