import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.join(process.cwd(),'dist');const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));if(!file.startsWith(root+path.sep)||relative.split('/').some(s=>s.startsWith('.'))){res.writeHead(403).end();return;}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(body);}catch{res.writeHead(404).end('Not found');}}).listen(4186,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4186'));
