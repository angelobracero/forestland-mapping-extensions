import { createPendingTargetStore } from "./pending-target-store";

// Set once by forestland-menu's Region -> Province sidebar browser, delivered
// once to lcmap-filter after the page navigation completes, so it knows which
// Region/Province to pre-select (LC Map Number is left for the visitor to
// pick themselves). Mirrors comment-navigation-store.ts, which does the same
// handoff but also pins an exact LC Map Number/comment.
export type PendingRegionTarget = {
  region: string;
  province: string;
};

const store = createPendingTargetStore<PendingRegionTarget>();

export const setPendingRegionTarget = store.setPendingTarget;
export const subscribeToPendingRegionTarget = store.subscribeToPendingTarget;
