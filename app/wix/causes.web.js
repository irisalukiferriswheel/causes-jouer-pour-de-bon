// Wix backend/causes.web.js. This method only exposes public cause information.
import { Permissions, webMethod } from 'wix-web-module';
import { secrets } from 'wix-secrets-backend.v2';
import { elevate } from 'wix-auth';
import { fetch } from 'wix-fetch';

const readSecret = elevate(secrets.getSecretValue);
export const listPublicCauses = webMethod(Permissions.Anyone, async (locale='fr-CA') => {
  try {
    const secret = await readSecret('JPDB_API_BASE_URL');
    const base = new URL(String(secret?.value || '').trim());
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error('Invalid base');
    const root = base.href.replace(/\/+$/, '').replace(/\/v1$/, '');
    const lang = locale === 'en-CA' || locale === 'en' ? 'en' : 'fr';
    const response = await fetch(`${root}/v1/causes?lang=${lang}`, { method:'GET', headers:{Accept:'application/json'} });
    if(!response.ok) throw new Error('Unavailable');
    const value = await response.json();
    if(!Array.isArray(value?.data)) throw new Error('Invalid response');
    // Deliberately omit public contributor aliases and any future private fields.
    return {data:value.data.map(c=>({id:c.id,name:c.name,description:c.description,country:c.country,
      websiteUrl:c.websiteUrl,locale:c.locale,supporterCount:c.supporterCount,featured:c.featured}))};
  } catch {
    throw new Error('Les causes ne sont pas disponibles pour le moment.');
  }
});
