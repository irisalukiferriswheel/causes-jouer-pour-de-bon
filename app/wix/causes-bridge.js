// Copy to Wix public/causes-bridge.js. Only approved canonical /v1/causes rows enter here.
// Initial editorial selection; edit these IDs to curate Causes we love.
export const FEATURED_CAUSE_IDS = [
 '65a1b359-c5d8-4c26-ab1d-69b7df2b4ee0',
 '2a792305-0ea3-4712-b376-b4b02ba40476',
 '1d833609-7e81-4659-839d-cbe1bac23ec1'
];
export function projectCauses(response, now = new Date().toISOString()) {
 if (!response || !Array.isArray(response.data)) throw new Error('Invalid API response');
 return {updatedAt:now,causes:response.data.map(c=>({
   id:c.id,name:c.name,description:c.description,country:c.country,websiteUrl:c.websiteUrl,
   goalAmount:c.goalAmount,raisedAmount:c.raisedAmount,currency:c.currency,imageUrl:c.imageUrl,campaignStart:c.campaignStart,campaignEnd:c.campaignEnd,
   supporterCount:Number.isSafeInteger(c.supporterCount)&&c.supporterCount>=0?c.supporterCount:null,
   featured:typeof c.featured==='boolean'?c.featured:FEATURED_CAUSE_IDS.includes(c.id)
 }))};
}
export function createCausesResponder({load,send,getLanguage}) {
 const inFlight=new Map();
 let last={key:null,time:0,payload:null};
 return async message=>{
  if(message?.type!=='JPDB_CAUSES_REQUEST'||typeof message.requestId!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(message.requestId))return;
  const requestId=message.requestId;
  const language=getLanguage()==='en'?'en':'fr';
  // A request carries presentation preferences only. Never accept identity or API URLs.
  try {
   let payload;
   if(last.key===language&&Date.now()-last.time<30000)payload=last.payload;
   else {
    if(!inFlight.has(language))inFlight.set(language,Promise.resolve().then(()=>load(language)).then(projectCauses));
    payload=await inFlight.get(language);
    last={key:language,time:Date.now(),payload};
   }
   send({type:'JPDB_CAUSES_DATA',requestId,language,payload});
  } catch {send({type:'JPDB_CAUSES_ERROR',requestId});}
  finally{inFlight.delete(language);}
 };
}
