export const TRUSTED_PARENTS=['https://www.jouerpourdebon.ca','https://jouerpourdebon.ca','https://editor.wix.com','https://yellowpagescanada-website-10110.editor.wix.com'];
export const isTrustedParent=(event,parent)=>event.source===parent && TRUSTED_PARENTS.includes(event.origin);
export function safeUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
const text=(v,n=500)=>typeof v==='string'?v.slice(0,n):'';
export function normalize(payload){
 if(!payload || !Array.isArray(payload.causes)) throw new Error('Invalid causes response');
 const seen=new Set();
 const causes=payload.causes.filter(c=>c && typeof c.id==='string' && !seen.has(c.id) && seen.add(c.id)).map(c=>({
  id:text(c.id,100),name:text(c.name,180),description:text(c.description,4000),
  country:text(c.country,100),websiteUrl:safeUrl(c.websiteUrl),
  supporterCount:Number.isSafeInteger(c.supporterCount)&&c.supporterCount>=0?c.supporterCount:null,
  featured:c.featured===true,translations:Array.isArray(c.translations)?c.translations.map(t=>({locale:text(t.locale,12),name:text(t.name,180),description:text(t.description,4000)})):[]
 })).filter(c=>c.name);
 return {causes,updatedAt:Number.isFinite(Date.parse(payload.updatedAt))?payload.updatedAt:null};
}
export function localized(c,lang){const t=c.translations.find(t=>t.locale===lang+'-CA')||c.translations.find(t=>t.locale===lang);return {...c,name:t?.name||c.name,description:t?.description||c.description};}
const fold=v=>v.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase();
export function selectCauses(causes,{language='fr',query='',kind='supported',sort='name'}={}){
 const q=fold(query.trim());
 return causes.filter(c=>kind==='featured'?c.featured:c.supporterCount>0).map(c=>localized(c,language)).filter(c=>fold([c.name,c.description,c.country].join(' ')).includes(q)).sort((a,b)=>sort==='supporters'?b.supporterCount-a.supporterCount||a.name.localeCompare(b.name,language):a.name.localeCompare(b.name,language));
}
