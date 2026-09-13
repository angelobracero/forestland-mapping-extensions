import { createPendingTargetStore } from "./pending-target-store";

// Set once by view-feedbacks' "View on Map" button, delivered once to
// lcmap-filter after the page navigation completes, so it knows which
// Region/Province/LC Number to auto-select and which specific comment to
// zoom to on the map.
export type PendingCommentTarget = {
  objectId: number;
  region: string;
  province: string;
  lcNumber: string;
};

const store = createPendingTargetStore<PendingCommentTarget>();

export const setPendingCommentTarget = store.setPendingTarget;
export const subscribeToPendingCommentTarget = store.subscribeToPendingTarget;
