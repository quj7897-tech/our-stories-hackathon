// Keep the engine within the host's per-file limit. No external CDN dependency.
const fs=require('fs'),zlib=require('zlib'),path=require('path');
const root=path.join(__dirname,'../dist/godot');
const wasm=path.join(root,'index.wasm');
if(fs.existsSync(wasm)){
 fs.writeFileSync(wasm+'.gz',zlib.gzipSync(fs.readFileSync(wasm),{level:9}));
 fs.unlinkSync(wasm);
}
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=`<script>
// Locally compressed official Godot engine; browsers may already decode HTTP gzip.
const loveOriginalFetch = window.fetch.bind(window);
window.fetch = async function(input, options) {
 const requested = typeof input === 'string' ? input : input.url;
 const url = new URL(requested, location.href);
 if (url.origin === location.origin && url.pathname.endsWith('/index.wasm')) {
   const response = await loveOriginalFetch(url.href + '.gz', options);
   if (!response.ok) throw new Error('无法加载游戏画面，请刷新重试。');
   const bytes = new Uint8Array(await response.arrayBuffer());
   const raw = bytes[0] === 31 && bytes[1] === 139
     ? new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
     : new Blob([bytes]).stream();
   return new Response(raw, {headers:{'Content-Type':'application/wasm'}});
 }
 return loveOriginalFetch(input,options);
};
</script>`;
if(!html.includes('loveOriginalFetch'))html=html.replace('<head>','<head>\n'+script+'\n<link rel="icon" href="data:,">');
fs.writeFileSync(path.join(root,'index.html'),html);
console.log('Compressed engine:',fs.statSync(wasm+'.gz').size,'bytes');
