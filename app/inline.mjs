import {readFile,writeFile} from 'node:fs/promises';
let html=await readFile('dist/index.html','utf8');
const js=html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/);
const css=html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/);
// Inline all assets: the resulting file can be pasted into a Wix HTML component.
const code=await readFile('dist/'+js[1].replace(/^\.\//,''),'utf8');
html=html.replace(js[0],()=>'<script type="module">'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
const style=await readFile('dist/'+css[1].replace(/^\.\//,''),'utf8');
html=html.replace(css[0],()=>'<style>'+style+'</style>');
await writeFile('../causes-embed.html',html);
await writeFile('../causes-preview.html',html.replace('<head>','<head><script>window.JPDB_CAUSES_PREVIEW=true;</script>'));
console.log('Built self-contained embed and preview.');

