const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const publicDir = path.join(root, "public");
const port = Number(process.env.PORT || 5173);
const logFile = path.join(root, "local-deploy-server.log");

function log(message) {
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
}

process.on("uncaughtException", (error) => {
  log(`uncaughtException: ${error.stack || error.message}`);
});

process.on("unhandledRejection", (error) => {
  log(`unhandledRejection: ${error?.stack || error}`);
});

const types = {
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
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function safeJoin(base, requestPath) {
  const file = path.resolve(base, requestPath.replace(/^\/+/, ""));
  return file.toLowerCase().startsWith(base.toLowerCase()) ? file : null;
}

function candidates(urlPath) {
  if (urlPath === "/") {
    return [path.join(dist, "index.html")];
  }

  const normalized = decodeURIComponent(urlPath);
  return [
    safeJoin(dist, normalized),
    safeJoin(publicDir, normalized),
    safeJoin(root, normalized),
    path.join(dist, "index.html"),
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

server.listen(port, "127.0.0.1", () => {
  const message = `Portfolio deployed locally: http://127.0.0.1:${port}/`;
  console.log(message);
  log(message);
});

server.on("error", (error) => {
  log(`server error: ${error.stack || error.message}`);
});
