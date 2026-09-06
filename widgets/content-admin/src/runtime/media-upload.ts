// Two-step upload: ask the Worker for a presigned R2 PUT URL (this is
// what checks the file type/size and validates it), then PUT the file
// bytes straight to R2 using that URL. The Worker itself never sees the
// file -- it only signs the URL, so the actual upload goes browser -> R2
// directly.
const UPLOAD_URL_ENDPOINT = "https://upload.angelobracero35.workers.dev/upload-url";
const DELETE_OBJECT_ENDPOINT = "https://upload.angelobracero35.workers.dev/delete-object";
const PUBLIC_MEDIA_URL_PREFIX = "https://files.angelobracero.com/";

// Removes a previously uploaded file from R2, given its public URL. Best
// effort by design -- called after a row/edit is already saved elsewhere,
// so a failure here shouldn't undo that. Silently does nothing for a URL
// that isn't one of our uploads (e.g. a legacy manually-pasted link).
export async function deleteMediaFileByUrl(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_MEDIA_URL_PREFIX)) return;

  const key = url.slice(PUBLIC_MEDIA_URL_PREFIX.length);

  const response = await fetch(DELETE_OBJECT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Could not delete file.");
  }
}

const IMAGE_MIME_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const VIDEO_MIME_TYPES = "video/mp4,video/webm,video/quicktime";

export type UploadKind = "image" | "video" | "media";

export const UPLOAD_ACCEPT_BY_KIND: Record<UploadKind, string> = {
  image: IMAGE_MIME_TYPES,
  video: VIDEO_MIME_TYPES,
  media: `${IMAGE_MIME_TYPES},${VIDEO_MIME_TYPES}`,
};

export const UPLOAD_LABEL_BY_KIND: Record<UploadKind, string> = {
  image: "Upload Image",
  video: "Upload Video",
  media: "Upload File",
};

export type UploadResult = {
  url: string;
  type: "image" | "video";
};

export async function uploadMediaFile(file: File): Promise<UploadResult> {
  // Computed once and reused for both requests below -- the presigned
  // URL's signature only covers the "content-type" header (see
  // SignedHeaders in the worker), so the metadata request and the actual
  // PUT must send byte-for-byte the same Content-Type or R2 will reject
  // the PUT with a signature mismatch (403). file.type can be an empty
  // string for some browsers/file types, which is a silent way for the
  // two requests to end up inconsistent, hence the fallback here.
  const contentType = file.type || "application/octet-stream";

  const presignResponse = await fetch(UPLOAD_URL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType,
      size: file.size,
    }),
  });

  const presignData = await presignResponse.json();

  if (!presignData.success) {
    throw new Error(presignData.error || "Could not create upload URL.");
  }

  const putResponse = await fetch(presignData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!putResponse.ok) {
    let responseText = "";

    try {
      responseText = await putResponse.text();
    } catch {
      responseText = "(could not read response body)";
    }

    console.error(
      "[uploadMediaFile] R2 PUT failed:",
      putResponse.status,
      responseText,
    );

    throw new Error("Upload to storage failed.");
  }

  return { url: presignData.url, type: presignData.type };
}
