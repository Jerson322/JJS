// Minimal service worker — no offline caching, exists only so the browser
// considers the site installable (required for the PWA Share Target to
// show up in the OS share sheet). Intentionally does not intercept fetch.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {});
