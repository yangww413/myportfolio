const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist-codex");
const publicDir = path.join(root, "public");
const port = 4176;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
};

function safeJoin(base, requestPath) {
  const candidate = path.resolve(base, requestPath.replace(/^\/+/, ""));
  return candidate.toLowerCase().startsWith(base.toLowerCase()) ? candidate : null;
}

function getCandidates(urlPath) {
  if (urlPath === "/") return [path.join(dist, "index.html")];
  const normalized = decodeURIComponent(urlPath);
  return [
    safeJoin(dist, normalized),
    safeJoin(publicDir, normalized),
    safeJoin(root, normalized),
    path.join(dist, "index.html"),
  ].filter(Boolean);
}

const server = http.createServer((request, response) => {
  const urlPath = new URL(request.url, "http://127.0.0.1").pathname;
  const file = getCandidates(urlPath).find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());

  if (!file) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1");
