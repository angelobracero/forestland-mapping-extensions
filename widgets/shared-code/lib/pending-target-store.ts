// Generic "deliver this exactly once to whoever's listening next" pub/sub.
// Backs comment-navigation-store.ts and region-navigation-store.ts, which
// both do the same kind of cross-widget page-navigation handoff (one
// widget sets a target right before navigating to a page; that page's
// widget subscribes and receives it, once, whether it was already mounted
// or mounts fresh afterward). Browser-only, in memory -- nothing here is
// persisted, uploaded, or shared between visitors.
export function createPendingTargetStore<T>() {
  type Listener = (target: T) => void;

  let pendingTarget: T | null = null;
  const listeners = new Set<Listener>();

  function setPendingTarget(target: T): void {
    pendingTarget = target;

    // If the destination widget is already mounted (Experience Builder may
    // keep pages mounted across navigation rather than remounting them),
    // deliver it immediately rather than waiting for a mount that may
    // never happen.
    if (listeners.size > 0) {
      pendingTarget = null;

      listeners.forEach((listener) => listener(target));
    }
  }

  // Subscribes to future targets. If one was already set before this
  // widget subscribed (e.g. it mounts fresh, after the target was already
  // set), delivers it immediately. Either way, a given target is only
  // ever delivered once. Returns an unsubscribe function for a useEffect
  // cleanup.
  function subscribeToPendingTarget(listener: Listener): () => void {
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

  return { setPendingTarget, subscribeToPendingTarget };
}
