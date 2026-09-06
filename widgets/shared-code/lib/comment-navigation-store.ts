// Set once by view-feedbacks' "View on Map" button, delivered once to
// lcmap-filter after the page navigation completes, so it knows which
// Region/Province/LC Number to auto-select and which specific comment to
// zoom to on the map. Browser-only, in memory -- nothing here is
// persisted, uploaded, or shared between visitors.
export type PendingCommentTarget = {
  objectId: number;
  region: string;
  province: string;
  lcNumber: string;
};

type Listener = (target: PendingCommentTarget) => void;

let pendingTarget: PendingCommentTarget | null = null;
const listeners = new Set<Listener>();

export function setPendingCommentTarget(target: PendingCommentTarget): void {
  pendingTarget = target;

  // If lcmap-filter is already mounted (Experience Builder may keep pages
  // mounted across navigation rather than remounting them), deliver it
  // immediately rather than waiting for a mount that may never happen.
  if (listeners.size > 0) {
    pendingTarget = null;

    listeners.forEach((listener) => listener(target));
  }
}

// Subscribes to future targets. If one was already set before this widget
// subscribed (e.g. it mounts fresh, after the button already navigated
// here), delivers it immediately. Either way, a given target is only ever
// delivered once. Returns an unsubscribe function for a useEffect cleanup.
export function subscribeToPendingCommentTarget(listener: Listener): () => void {
  listeners.add(listener);

  if (pendingTarget) {
    const target = pendingTarget;

    pendingTarget = null;
    listener(target);
  }

  return () => {
    listeners.delete(listener);
  };
}
