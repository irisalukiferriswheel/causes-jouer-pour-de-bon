// Public anon JWT required by the Edge Function gateway; not a privileged key.
const PUBLIC_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhieWpiZ214Z295empxbG54bWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzE2NzMsImV4cCI6MjA5NjEwNzY3M30.Vcv3lMnu_Y_sUX4Wk5iL5r5_F0oBTpJsXFobYpIAykU';
export async function loadCauses(language,signal){
 const response=await fetch('https://xbyjbgmxgoyzjqlnxmgi.supabase.co/functions/v1/public-causes?lang='+language,{headers:{Authorization:'Bearer '+PUBLIC_KEY,apikey:PUBLIC_KEY},signal});
 if(!response.ok)throw new Error('Causes unavailable');
 return response.json();
}
