// Servidor estático local del frontend; no necesita dependencias externas.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = process.env.PUERTO || 8080;
const CARPETA_PUBLICA = path.resolve(__dirname);
const TIPOS_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

const servidor = http.createServer((req, res) => {
  let rutaSolicitada;
  try {
    rutaSolicitada = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Solicitud inválida.');
    return;
  }
  if (rutaSolicitada === '/') rutaSolicitada = '/index.html';
  const rutaArchivo = path.resolve(CARPETA_PUBLICA, `.${rutaSolicitada}`);
  if (!rutaArchivo.startsWith(`${CARPETA_PUBLICA}${path.sep}`)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acceso denegado.');
    return;
  }
  fs.readFile(rutaArchivo, (error, contenido) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(error.code === 'ENOENT' ? 'Archivo no encontrado.' : 'No fue posible leer el archivo.');
      return;
    }
    const extension = path.extname(rutaArchivo);
    res.writeHead(200, { 'Content-Type': TIPOS_MIME[extension] || 'application/octet-stream' });
    res.end(contenido);
  });
});

servidor.listen(PUERTO, () => console.log(`Frontend disponible en http://localhost:${PUERTO}`));
