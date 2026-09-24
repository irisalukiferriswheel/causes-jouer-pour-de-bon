export function fundingMetrics(cause){
 const amount=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&Number.isSafeInteger(Math.round(v*100))?v:null;
 const raised=amount(cause.raisedAmount),target=amount(cause.goalAmount),goal=target>0?target:null;
 const currency=typeof cause.currency==='string'&&/^[A-Z]{3}$/.test(cause.currency)?cause.currency:null;
 return {raised,goal,currency,percent:raised!==null&&goal?raised/goal*100:null,remaining:raised!==null&&goal?Math.max(0,Math.round((goal-raised)*100)/100):null};
}
