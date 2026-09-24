import {publicPayload} from './funding.mjs';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'GET, OPTIONS'};
async function rows(table:string,params:Record<string,string>,optional=false){
 const result=[];
 for(let offset=0;;offset+=500){
  const url=new URL(Deno.env.get('SUPABASE_URL')+'/rest/v1/'+table);
  Object.entries({...params,limit:'500',offset:String(offset)}).forEach(([k,v])=>url.searchParams.set(k,v));
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const response=await fetch(url,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});
  if(!response.ok){const error=await response.json();if(optional&&['42P01','PGRST205'].includes(error.code))return [];throw new Error('Database read failed');}
  const page=await response.json();result.push(...page);if(page.length<500)return result;
 }
}
async function batches(table:string,field:string,ids:string[],params:Record<string,string>,optional=false){
 const result=[];for(let i=0;i<ids.length;i+=100)result.push(...await rows(table,{...params,[field]:'in.('+ids.slice(i,i+100).join(',')+')'},optional));return result;
}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='GET')return Response.json({error:'Method not allowed'},{status:405,headers:cors});
 // The Supabase gateway verifies the JWT. This endpoint intentionally serves only
 // public aggregates to the anon role; privileged credentials never leave here.
 try{
  const language=new URL(req.url).searchParams.get('lang')==='en'?'en':'fr';
  const settings=await rows('cause_page_settings',{select:'*',publish_ready:'eq.true',order:'cause_id'});
  const ids=settings.map(s=>s.cause_id);
  if(!ids.length)return Response.json({causes:[],updatedAt:new Date().toISOString()},{headers:{...cors,'Cache-Control':'public, max-age=60'}});
  const [causes,translations,chosen,contributions,allocations]=await Promise.all([
   batches('causes','id',ids,{select:'*',status:'eq.approved',order:'id'}),
   batches('cause_translations','cause_id',ids,{select:'cause_id,locale,name,description',order:'id'}),
   batches('registrations','cause_id',ids,{select:'id,user_id,cause_id,status',status:'eq.confirmed',order:'id'}),
   batches('player_contributions','cause_id',ids,{select:'id,registration_id,cause_id,amount,currency,status',order:'id'}),
   batches('cause_funding_allocations','cause_id',ids,{select:'id,registration_id,cause_id,cause_amount,currency,status',order:'id'},true)
  ]);
  const linkedIds=[...new Set([...contributions,...allocations].map(e=>e.registration_id))];
  const linked=await batches('registrations','id',linkedIds,{select:'id,user_id,cause_id,status',order:'id'});
  const payload=publicPayload({settings,causes,translations,registrations:[...chosen,...linked],contributions,allocations},language);
  return Response.json(payload,{headers:{...cors,'Cache-Control':'public, max-age=60'}});
 }catch{return Response.json({error:'Causes unavailable'},{status:503,headers:{...cors,'Cache-Control':'no-store'}});}
});
