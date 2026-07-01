// Minimal service worker — exists only to satisfy PWA installability
// criteria (Chrome requires a registered SW with a fetch handler).
// No offline caching / sync queue: accepted risk per design doc Edge Cases —
// a movement logged with no connection is lost, not queued.
self.addEventListener("fetch", () => {});
