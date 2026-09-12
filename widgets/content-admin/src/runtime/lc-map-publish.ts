import esriRequest from "@arcgis/core/request";
import { getAppStore } from "jimu-core";

// Publishing a shapefile is a multi-step ArcGIS Online operation with no
// single wrapped helper in the installed @esri/arcgis-rest-portal version
// (it only exposes getItemStatus, which assumes you already started the
// job elsewhere) -- so this calls the Sharing REST API directly with
// esriRequest, the same way @arcgis/core/layers already authenticates
// every other call in this project against the signed-in portal session.
// See: https://developers.arcgis.com/rest/users-groups-and-items/add-item.htm
//      https://developers.arcgis.com/rest/users-groups-and-items/publish-item.htm
//      https://developers.arcgis.com/rest/users-groups-and-items/status.htm

// Folder (by name, not id) that uploaded shapefiles should land in, inside
// whichever admin's account is signed in when they publish. A folder id is
// specific to the account it was created under -- a hardcoded id only
// worked for the account that folder was created in and failed with "folder
// not found" for every other admin. Looking it up by name (and creating it
// if that admin doesn't have it yet) works the same for any account.
const UPLOAD_FOLDER_NAME = "Forestland Evaluation & Mapping Project";

// Finds this admin's own copy of UPLOAD_FOLDER_NAME (folders are per-user,
// so it's normal for a different admin not to have one yet), creating it if
// it doesn't exist. See https://developers.arcgis.com/rest/users-groups-and-items/user-content.htm
// and https://developers.arcgis.com/rest/users-groups-and-items/create-folder.htm
// -- confirmed against @esri/arcgis-rest-portal's own getUserContent/
// createFolder source for the exact endpoints.
async function getOrCreateUploadFolder(userContentUrl: string): Promise<string> {
  const contentResponse = await esriRequest(userContentUrl, {
    query: { f: "json", num: 100 },
  });

  const existingFolder = (contentResponse.data?.folders ?? []).find(
    (folder: { id: string; title: string }) => folder.title === UPLOAD_FOLDER_NAME,
  );

  if (existingFolder) {
    return existingFolder.id;
  }

  const createFolderFormData = new FormData();

  createFolderFormData.append("f", "json");
  createFolderFormData.append("title", UPLOAD_FOLDER_NAME);

  const createResponse = await esriRequest(`${userContentUrl}/createFolder`, {
    method: "post",
    body: createFolderFormData,
  });

  if (!createResponse.data?.success || !createResponse.data?.folder?.id) {
    throw new Error(
      createResponse.data?.error?.message || "Could not create the upload folder.",
    );
  }

  return createResponse.data.folder.id;
}

export type PublishStage = "uploading" | "publishing" | "sharing";

export type PublishResult = {
  // The item id of the newly published hosted feature layer (NOT the
  // uploaded shapefile item -- that's a separate, intermediate item).
  itemId: string;
};

function getPortalContext(): { userContentUrl: string } {
  const state = getAppStore().getState();
  const portalUrl = (state.portalUrl || "https://www.arcgis.com").replace(/\/$/, "");
  const username = state.portalSelf?.user?.username;

  if (!username) {
    throw new Error("You must be signed in to publish a layer.");
  }

  return {
    userContentUrl: `${portalUrl}/sharing/rest/content/users/${encodeURIComponent(username)}`,
  };
}

async function pollPublishStatus(
  userContentUrl: string,
  serviceItemId: string,
  jobId: string,
): Promise<void> {
  const POLL_INTERVAL_MS = 3000;
  const MAX_ATTEMPTS = 40; // ~2 minutes total

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const response = await esriRequest(
      `${userContentUrl}/items/${serviceItemId}/status`,
      { query: { f: "json", jobType: "publish", jobId } },
    );

    const status = response.data?.status;

    if (status === "completed") return;

    if (status === "failed") {
      throw new Error(response.data?.statusMessage || "Publishing failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(
    "Publishing is taking longer than expected. Check ArcGIS Online directly for its status.",
  );
}

export async function uploadAndPublishShapefile(
  file: File,
  layerName: string,
  onProgress?: (stage: PublishStage) => void,
): Promise<PublishResult> {
  const { userContentUrl } = getPortalContext();

  // 1. Upload the zipped shapefile as its own item.
  onProgress?.("uploading");

  const uploadFormData = new FormData();

  // Two different admins' shapefiles can share the same original filename
  // (e.g. a GIS tool's default export name) without being related at all --
  // ArcGIS rejects an addItem whose file name collides with an existing
  // item, and overwriting on collision would silently replace someone
  // else's unrelated item. Uploading under a timestamp-prefixed name avoids
  // the collision entirely instead of risking that.
  const uniqueFileName = `${Date.now()}-${file.name}`;

  uploadFormData.append("f", "json");
  uploadFormData.append("type", "Shapefile");
  uploadFormData.append("title", layerName);
  uploadFormData.append("file", file, uniqueFileName);

  const folderId = await getOrCreateUploadFolder(userContentUrl);

  const uploadResponse = await esriRequest(`${userContentUrl}/${folderId}/addItem`, {
    method: "post",
    body: uploadFormData,
  });

  if (!uploadResponse.data?.success || !uploadResponse.data?.id) {
    throw new Error(
      uploadResponse.data?.error?.message || "Could not upload the shapefile.",
    );
  }

  const shapefileItemId: string = uploadResponse.data.id;

  // 2. Publish the uploaded shapefile as a hosted feature layer.
  onProgress?.("publishing");

  const publishFormData = new FormData();

  publishFormData.append("f", "json");
  publishFormData.append("itemId", shapefileItemId);
  publishFormData.append("filetype", "shapefile");
  publishFormData.append("publishParameters", JSON.stringify({ name: layerName }));

  const publishResponse = await esriRequest(`${userContentUrl}/publish`, {
    method: "post",
    body: publishFormData,
  });

  // Esri's documented response shape wraps the result in a `services` array,
  // but this hasn't been confirmed for filetype=shapefile specifically (the
  // installed @esri/arcgis-rest-portal doesn't wrap this endpoint, so there's
  // no local type to check against) -- fall back to reading the same fields
  // off the top-level response in case shapefile publishing responds without
  // that wrapper.
  const service = publishResponse.data?.services?.[0] ?? publishResponse.data;
  const serviceItemId: string | undefined =
    service?.serviceItemId ?? service?.itemId;

  if (!serviceItemId) {
    throw new Error(
      publishResponse.data?.error?.message || "Could not start publishing.",
    );
  }

  if (service.jobId) {
    await pollPublishStatus(userContentUrl, serviceItemId, service.jobId);
  }

  // 3. Share the new layer with the organization, so it's visible on the
  // public site the same way today's LC map layers already are (lcmap-filter
  // has no sharing workaround, so it relies on the layer already being
  // shared org/public).
  onProgress?.("sharing");

  const shareFormData = new FormData();

  shareFormData.append("f", "json");
  shareFormData.append("org", "true");
  shareFormData.append("everyone", "false");

  await esriRequest(`${userContentUrl}/items/${serviceItemId}/share`, {
    method: "post",
    body: shareFormData,
  });

  return { itemId: serviceItemId };
}

// Permanently deletes a real ArcGIS item -- used by LcMapsSection's "Remove"
// action, which deletes the actual published hosted feature layer, not just
// a row in the catalog table. Deliberately targets the item's own owner
// (row.owner in LcMapsSection, tracked at publish time for exactly this),
// not whichever admin is currently signed in -- ArcGIS's delete endpoint is
// scoped to /users/<owner>/items/<id>/delete regardless of caller, and only
// succeeds if the signed-in account IS that owner, or has org-admin content
// privileges over other users' items.
export async function deletePortalItem(
  ownerUsername: string,
  itemId: string,
): Promise<void> {
  const state = getAppStore().getState();
  const portalUrl = (state.portalUrl || "https://www.arcgis.com").replace(/\/$/, "");
  const userContentUrl = `${portalUrl}/sharing/rest/content/users/${encodeURIComponent(ownerUsername)}`;

  const formData = new FormData();

  formData.append("f", "json");

  const response = await esriRequest(`${userContentUrl}/items/${itemId}/delete`, {
    method: "post",
    body: formData,
  });

  if (!response.data?.success) {
    throw new Error(
      response.data?.error?.message || "Could not delete the item from ArcGIS.",
    );
  }
}
