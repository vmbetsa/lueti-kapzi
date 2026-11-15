// Lüti Kapzi Service Worker: nur für Benachrichtigungen
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: "Lüti Kapzi", body: e.data ? e.data.text() : "" }; }
  const url = new URL(d.url || "./", self.registration.scope).href;
  e.waitUntil(self.registration.showNotification(d.title || "Lüti Kapzi", {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || "lk",
    renotify: true,
    data: { url }
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope)) {
        try { await c.focus(); c.postMessage({ go: new URL(url).searchParams.get("go") || "" }); return; } catch (err) {}
      }
    }
    await self.clients.openWindow(url);
  })());
});
