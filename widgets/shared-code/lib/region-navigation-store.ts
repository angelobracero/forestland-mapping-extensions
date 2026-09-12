// Set once by forestland-menu's Region -> Province sidebar browser, delivered
// once to lcmap-filter after the page navigation completes, so it knows which
// Region/Province to pre-select (LC Map Number is left for the visitor to
// pick themselves). Browser-only, in memory -- nothing here is persisted,
// uploaded, or shared between visitors. Mirrors comment-navigation-store.ts,
// which does the same handoff but also pins an exact LC Map Number/comment.
export type PendingRegionTarget = {
  region: string;
  province: string;
};

type Listener = (target: PendingRegionTarget) => void;

let pendingTarget: PendingRegionTarget | null = null;
const listeners = new Set<Listener>();

export function setPendingRegionTarget(target: PendingRegionTarget): void {
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
// subscribed (e.g. it mounts fresh, after the sidebar already navigated
// here), delivers it immediately. Either way, a given target is only ever
// delivered once. Returns an unsubscribe function for a useEffect cleanup.
export function subscribeToPendingRegionTarget(listener: Listener): () => void {
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
