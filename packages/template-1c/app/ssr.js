const path = require("path");
const {
  createApp,
  createHandler,
  serveStaticFile,
} = require("pwa-kit-runtime/ssr/server/express");

const app = createApp({
  // The build directory (an absolute path)
  buildDir: path.resolve(process.cwd(), "build"),

  // The cache time for SSR'd pages (defaults to 600 seconds)
  defaultCacheTimeSeconds: 600,

  // The path to the favicon. This must also appear in
  // the mobify.ssrShared section of package.json.
  faviconPath: path.resolve("static/ico/favicon.ico"),

  // The location of the apps manifest file relative to the build directory
  manifestPath: "static/manifest.json",

  // The port that the local dev server listens on
  port: 3000,

  // The protocol on which the development Express app listens.
  // Note that http://localhost is treated as a secure context for development.
  protocol: "http",

  enableLegacyRemoteProxying: false,
});

// Handle the redirect from SLAS as to avoid error
app.get("/callback?*", (req, res) => {
  res.send();
});
app.get("/robots.txt", serveStaticFile("static/robots.txt"));

// SSR requires that we export a single handler function called 'get', that
// supports AWS use of the server that we created above.
exports.get = createHandler(app);