import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { resolveFieldName } from "./field-utils";

// These exact ArcGIS accounts always get content-admin access, regardless
// of what's in the app_admins table below -- hardcoded so they can never
// be locked out even if that table is empty or unreachable. Only these
// accounts can add/remove rows in that table themselves (see
// content-admin/src/runtime/widget.tsx). Checked against the "Username"
// field on their profile, not their display name or email.
export const SUPER_ADMIN_USERNAMES = ["albracero"];

// Additional content admins (content-only -- they can edit GAD/LCD/About
// and delete comments, but can't manage this list themselves) are looked
// up from this table at runtime.
export const ADMINS_TABLE_ITEM_ID = "b49704966b6944b68ebe3eaa9a0d4596";
export const ADMINS_TABLE_LAYER_ID = 0;

export async function checkIsContentAdmin(
  username: string | undefined,
): Promise<boolean> {
  if (!username) return false;

  if (SUPER_ADMIN_USERNAMES.includes(username)) return true;

  try {
    const adminsLayer = new FeatureLayer({
      portalItem: { id: ADMINS_TABLE_ITEM_ID },
      layerId: ADMINS_TABLE_LAYER_ID,
    });

    await adminsLayer.load();

    const usernameFieldName = resolveFieldName(adminsLayer, "username");

    if (!usernameFieldName) return false;

    const escapeValue = (value: string) => value.replace(/'/g, "''");

    const query = adminsLayer.createQuery();

    query.where = `${usernameFieldName} = '${escapeValue(username)}'`;
    query.outFields = [usernameFieldName];
    query.returnGeometry = false;

    const result = await adminsLayer.queryFeatures(query);

    return result.features.length > 0;
  } catch (error) {
    console.error("Failed to check app_admins table:", error);

    return false; // fail closed -- if we can't verify, don't grant access
  }
}
