const cents = value => {
 if (!['number','string'].includes(typeof value) || String(value).trim()==='') return null;
 const n=Number(value), c=Math.round(n*100);
 return n>=0 && Number.isSafeInteger(c) && Math.abs(n*100-c)<1e-6 ? c : null;
};
export function publicPayload({settings,causes,translations,registrations,contributions,allocations},language='fr',now=new Date().toISOString()) {
 const registered=new Map(registrations.map(r=>[r.id,r]));
 // A newer funding allocation supersedes the legacy entry for that registration,
 // including refunded allocations. Never sum both representations of one payment.
 const allocated=new Set(allocations.map(a=>a.registration_id));
 const ledger=[...allocations.map(a=>({...a,amount:a.cause_amount})),...contributions.filter(c=>!allocated.has(c.registration_id))];
 const byCause=new Map(causes.filter(c=>c.status==='approved'&&!c.canonical_cause_id).map(c=>[c.id,c]));
 return {updatedAt:now,causes:settings.filter(s=>s.publish_ready&&byCause.has(s.cause_id)).map(s=>{
  const cause=byCause.get(s.cause_id), ts=translations.filter(t=>t.cause_id===cause.id);
  const t=ts.find(t=>t.locale===language+'-CA')||ts.find(t=>t.locale===language)||ts.find(t=>t.locale===cause.default_locale);
  const users=new Set(registrations.filter(r=>r.cause_id===cause.id&&r.status==='confirmed').map(r=>r.user_id));
  let total=0;
  for(const entry of ledger){
   const r=registered.get(entry.registration_id), amount=cents(entry.amount);
   if(entry.cause_id!==cause.id||entry.status!=='confirmed'||r?.status!=='confirmed')continue;
   if(r.user_id)users.add(r.user_id);
   if(entry.currency===s.currency&&amount!==null)total+=amount;
  }
  if(!Number.isSafeInteger(total))throw new Error('Funding overflow');
  const goal=cents(s.funding_goal);
  return {id:cause.id,name:t?.name||cause.name,description:t?.description??cause.description,websiteUrl:cause.website_url,country:cause.country,
   featured:s.featured===true,imageUrl:s.image_url,goalAmount:goal>0?goal/100:null,currency:s.currency,raisedAmount:total/100,supporterCount:users.size,
   campaignStart:s.campaign_start,campaignEnd:s.campaign_end};
 })};
}
