const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let filePath = '.' + req.url.split('?')[0];
  if (filePath === './') filePath = './Simples.html';
  
  if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': ext === '.html' ? 'text/html; charset=utf-8' : 'text/plain' });
    res.end(content);
  });
});

server.listen(9393, () => {
  console.log('Crypto Facil rodando em http://localhost:9393/Simples.html');
});
