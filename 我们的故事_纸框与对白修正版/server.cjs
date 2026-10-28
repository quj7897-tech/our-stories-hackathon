'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const root = path.join(__dirname, 'dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wasm':'application/wasm','.pck':'application/octet-stream','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
let port = Number(process.env.LOVE_PORT || 8190), attempts = 0;
const server = http.createServer((req,res) => {
  let relative;
  try { relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch {res.writeHead(400);res.end();return;}
  const file = path.resolve(root, '.' + (relative === '/' ? '/index.html' : relative));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
  fs.stat(file,(err,stat) => {
    if (err || !stat.isFile()) {res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store','Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp','Cross-Origin-Resource-Policy':'same-origin'});
    if(req.method==='HEAD') {res.end();return;}
    fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  });
});
server.on('error',err=> {if(err.code==='EADDRINUSE' && attempts++<20) {port++;server.listen(port,'127.0.0.1');} else {console.error(err.message);process.exit(1);}});
server.on('listening',()=> {
  const url='http://127.0.0.1:'+server.address().port;
  console.log('\n《惊喜》完整一天修正版\n'+url+'\n保留此窗口即可游玩；按 Ctrl+C 关闭。\n');
  if(process.argv.includes('--open')) {
    const command=process.platform==='darwin'?'open':process.platform==='win32'?'cmd':'xdg-open';
    const args=process.platform==='win32'?['/c','start','',url]:[url];
    const child=spawn(command,args,{stdio:'ignore'}); child.on('error',()=>console.log('请手动打开上方网址。'));
  }
});
server.listen(port,'127.0.0.1');
