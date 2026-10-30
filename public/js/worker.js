// Background worker: runs the geometry jobs off the page's main thread.
importScripts("engine.js", "jobs.js");
const handle = createJobs(self.NP);
self.onmessage = (e) => {
  const q = e.data;
  try {
    const { msg, transfer } = handle(q);
    self.postMessage(Object.assign({ id: q.id }, msg), transfer || []);
  } catch (err) {
    self.postMessage({ id: q.id, error: String((err && err.message) || err) });
  }
};
