const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let filePath = '.' + req.url.split('?')[0];
  if (filePath === './') filePath = './Consolidated.html';
  
  if (req.url === '/favicon.ico' || req.url === '/favicon.svg') {
    const favPath = path.join(__dirname, 'favicon.svg');
    fs.readFile(favPath, (err, content) => {
      if (err) { res.writeHead(204); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      res.end(content);
    });
    return;
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ico':'image/x-icon'};
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(content);
  });
});

server.listen(9393, () => {
  console.log('CryptoMaster rodando em http://localhost:9393/Consolidated.html');
});
