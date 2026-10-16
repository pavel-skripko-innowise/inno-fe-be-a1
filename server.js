const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname);
const rootPrefix = root.endsWith(path.sep) ? root : root + path.sep;
const port = Number(process.env.PORT) || 8000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  let pathname = "/";
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch (err) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }
  if (pathname === "/") pathname = "/index.html";

  const file = path.resolve(root, pathname.replace(/^\/+/, ""));
  if (file !== root && !file.startsWith(rootPrefix)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(err.code === "ENOENT" ? 404 : 500);
      res.end(err.code === "ENOENT" ? "Not found" : "Error");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log("Курс: http://localhost:" + port);
});
