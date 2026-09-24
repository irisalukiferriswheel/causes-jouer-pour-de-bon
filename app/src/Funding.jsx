import React from 'react';
import {fundingMetrics} from './funding.js';
export function Funding({cause,language}){
 const f=fundingMetrics(cause),fr=language==='fr';
 const money=n=>new Intl.NumberFormat(language+'-CA',{style:'currency',currency:f.currency,currencyDisplay:'code',maximumFractionDigits:2}).format(n);
 return <div className="funding">
  <div className="funding-top"><strong>{f.raised!==null&&f.currency?money(f.raised):(fr?'Montant à venir':'Amount coming soon')}</strong><span>{fr?'amassés':'raised'}</span></div>
  <p>{f.goal&&f.currency?`${fr?'Objectif':'Goal'} : ${money(f.goal)}`:(fr?'Objectif à venir':'Goal coming soon')}</p>
  {f.percent!==null&&f.currency&&<><progress max="100" value={Math.min(100,f.percent)} aria-label={fr?'Progression du financement':'Funding progress'}/><div className="funding-bottom"><span>{new Intl.NumberFormat(language+'-CA',{maximumFractionDigits:1}).format(f.percent)} % {fr?'financé':'funded'}</span><span>{f.remaining===0?(fr?'Objectif atteint':'Goal reached'):`${money(f.remaining)} ${fr?'à amasser':'to go'}`}</span></div></>}
  {cause.campaignEnd&&<p className="campaign-date">{fr?'Fin de la campagne':'Campaign ends'} : {new Intl.DateTimeFormat(language+'-CA',{dateStyle:'medium',timeZone:'America/Toronto'}).format(new Date(cause.campaignEnd))}</p>}
 </div>;
}
