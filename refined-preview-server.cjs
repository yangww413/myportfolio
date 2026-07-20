const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist-refined");
const publicDir = path.join(root, "public");
const port = 5186;

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
};

function safeJoin(base, requestPath) {
  const file = path.resolve(base, requestPath.replace(/^\/+/, ""));
  return file.toLowerCase().startsWith(base.toLowerCase()) ? file : null;
}

function candidates(urlPath) {
  const normalized = decodeURIComponent(urlPath);
  if (normalized === "/") return [path.join(dist, "index.next.html")];
  return [
    safeJoin(dist, normalized),
    safeJoin(publicDir, normalized),
    safeJoin(root, normalized),
    path.join(dist, "index.next.html"),
  ].filter(Boolean);
}

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, "http://127.0.0.1").pathname;
  const file = candidates(urlPath).find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());

  if (!file) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, "0.0.0.0");

