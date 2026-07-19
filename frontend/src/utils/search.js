import Fuse from "fuse.js";
let fuse = null;
export function buildIndex(exercises) {
  fuse = new Fuse(exercises, {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "target", weight: 0.3 },
      { name: "category", weight: 0.1 },
      { name: "equipment", weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
  });
}
export function search(q) {
  return !fuse || !q.trim() ? [] : fuse.search(q).map((r) => r.item);
}
