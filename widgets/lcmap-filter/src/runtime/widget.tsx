import { type AllWidgetProps, getAppStore } from "jimu-core";
import { useEffect, useState } from "react";
import { enqueueNotification } from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import { resolveFieldName } from "widgets/shared-code/field-utils";
import { LC_MAP_CATALOG_ITEM_ID } from "widgets/shared-code/content-config";
import { PHILIPPINE_REGIONS } from "widgets/shared-code/philippine-regions";
import { setCurrentLcMapLayer } from "widgets/shared-code/local-layers-store";
import {
  type PendingCommentTarget,
  subscribeToPendingCommentTarget,
} from "widgets/shared-code/comment-navigation-store";
import { ensureLayerDataSource } from "./map-utils";
import { LayerFilterModal } from "./components/LayerFilterModal";

type LcMap = {
  region: string;
  province: string;
  lc_number: string;
  item_id: string;
};

const catalogLayer = new FeatureLayer({
  portalItem: {
    id: LC_MAP_CATALOG_ITEM_ID,
  },
});

const COMMENT_LAYER_PORTAL_ITEM_ID = "f534c711fbdb4837a74ee79de867ffa4";

// NOTE: these must exactly match the field names (including case) on the
// comment feature layer in AGOL. Update these constants if you name the
// fields differently there.
const REGION_FIELD = "region";
const PROVINCE_FIELD = "province";
const LC_NUMBER_FIELD = "lc_number";

const DRAWING_TOOL_BY_GEOMETRY_TYPE: Record<string, string> = {
  point: "esriFeatureEditToolPoint",
  multipoint: "esriFeatureEditToolMultiPoint",
  polyline: "esriFeatureEditToolLine",
  polygon: "esriFeatureEditToolPolygon",
};

function getCurrentUserDisplayName(): string | null {
  const user = getAppStore().getState().portalSelf?.user;

  return user?.fullName || user?.username || null;
}

function getCurrentUserEmail(): string | null {
  const user = getAppStore().getState().portalSelf?.user;

  return user?.email || null;
}

function Widget(props: AllWidgetProps<any>) {
  const [lcMaps, setLcMaps] = useState<LcMap[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedLcNumber, setSelectedLcNumber] = useState<string>("");
  const [jimuMapView, setJimuMapView] = useState<JimuMapView | null>(null);
  const [currentLcLayer, setCurrentLcLayer] = useState<FeatureLayer | null>(
    null,
  );
  const [commentLayer, setCommentLayer] = useState<FeatureLayer | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<PendingCommentTarget | null>(
    null,
  );

  // LOAD LC MAPS
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        await catalogLayer.load();

        const query = catalogLayer.createQuery();

        // Excludes soft-removed entries (see content-admin's LcMapsSection)
        // so a removed LC Map disappears from the public filter immediately,
        // without touching the underlying published layer.
        query.where = "removed IS NULL OR removed <> 1";
        query.outFields = ["region", "province", "lc_number", "item_id"];
        query.returnGeometry = false;

        const result = await catalogLayer.queryFeatures(query);

        const maps: LcMap[] = result.features.map((feature) => ({
          region: feature.attributes.region,
          province: feature.attributes.province,
          lc_number: feature.attributes.lc_number,
          item_id: feature.attributes.item_id,
        }));

        setLcMaps(maps);
      } catch (error) {
        console.error("Failed to load LC Map catalog:", error);
      }
    };

    loadCatalog();
  }, []);

  // ==========================================================
  // REGIONS
  // ==========================================================

  // Fixed, canonically-ordered list rather than deriving from the catalog's
  // own row order -- Province/LC Number below stay data-driven since not
  // every province/LC map exists yet, but every region is always a valid
  // choice regardless of whether it has an LC map published so far.
  const regions = PHILIPPINE_REGIONS;

  const provinces = [
    ...new Set(
      lcMaps
        .filter((map) => map.region === selectedRegion)
        .map((map) => map.province),
    ),
  ];

  const lcMapNumbers = [
    ...new Set(
      lcMaps
        .filter(
          (map) =>
            map.region === selectedRegion && map.province === selectedProvince,
        )
        .map((map) => map.lc_number),
    ),
  ];

  // Region, Province, and LC Number change handlers
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedProvince("");
    setSelectedLcNumber("");
  };

  const handleProvinceChange = async (province: string) => {
    setSelectedProvince(province);
    setSelectedLcNumber("");
  };

  const handleLcNumberChange = async (lc_number: string) => {
    setSelectedLcNumber(lc_number);

    if (!jimuMapView?.view?.map) {
      console.error("JimuMapView is not available.");

      return;
    }

    const map = jimuMapView.view.map;

    const selectedMap = lcMaps.find(
      (item) =>
        item.region === selectedRegion &&
        item.province === selectedProvince &&
        item.lc_number === lc_number,
    );

    if (!selectedMap) {
      console.error(
        "No LC Map found for:",
        selectedRegion,
        selectedProvince,
        lc_number,
      );

      return;
    }

    try {
      if (currentLcLayer) {
        map.remove(currentLcLayer);

        setCurrentLcLayer(null);
      }

      // Create LC Map layer
      // outFields must be set explicitly -- without it, FeatureLayer only
      // fetches the fields needed for rendering, so a popup can show its
      // template but no actual attribute values (a blank-looking popup).
      // editingEnabled: false is the reference layer this widget draws
      // from -- it's not meant to be user-editable, unlike the comment
      // layer. This is the same property the built-in Editor widget
      // itself checks to decide whether a layer can be edited at all
      // (use-feature-form.ts: `layer.editingEnabled ?? true`), so it
      // reliably blocks adding/editing/deleting features on this layer
      // regardless of which widget touches it.
      const lcLayer = new FeatureLayer({
        portalItem: {
          id: selectedMap.item_id,
        },
        outFields: ["*"],
        editingEnabled: false,
      });

      // Load map
      await lcLayer.load();

      // Add lc map to the map
      map.add(lcLayer);
      setCurrentLcLayer(lcLayer);

      // Let the local-layers-list widget show this layer too (zoom only --
      // it's the official layer, not something a visitor added themselves).
      setCurrentLcMapLayer({
        label: `${selectedRegion} · ${selectedProvince} · ${lc_number}`,
        layer: lcLayer,
      });

      // Register LC Map with Experience Builder
      await ensureLayerDataSource(lcLayer, jimuMapView);

      // Zoom to LC Map extent
      if (lcLayer.fullExtent) {
        await jimuMapView.view.goTo(lcLayer.fullExtent.expand(1.15));
      }

      // ------------------------------------------------------
      // Comment layer: rebuild it from scratch with a fresh
      // FeatureLayer instance every time the LC map changes.
      //
      // The built-in Editor widget caches its "active layer" reference
      // and only re-reads layer.templates (used to prefill new comment
      // features) when that reference actually changes -- mutating
      // .templates on a persistent layer instance is not enough to make
      // it notice. Swapping in a brand-new instance forces it to pick
      // up the current region/province/lc_number defaults.
      // ------------------------------------------------------

      if (commentLayer) {
        map.remove(commentLayer);

        setCommentLayer(null);
      }

      const newCommentLayer = new FeatureLayer({
        portalItem: {
          id: COMMENT_LAYER_PORTAL_ITEM_ID,
        },
        outFields: ["*"],
      });

      // Notify the user when a comment is actually saved, regardless of
      // which widget (e.g. the built-in Editor widget) performed the save.
      // NOTE: the ArcGIS JS API's "edits" event only fires for SUCCESSFUL
      // applyEdits() calls -- failed edits are not included in this event
      // at all, so there is no equivalent native signal here for a
      // "comment failed to save" toast. The Editor widget's own form
      // already surfaces validation/save errors in its UI.
      newCommentLayer.on("edits", (event) => {
        if (event.addedFeatures?.length > 0) {
          enqueueNotification({
            message: "Comment added successfully.",
            severity: "success",
            placement: "bottom-left",
          });
        }

        if (event.updatedFeatures?.length > 0) {
          enqueueNotification({
            message: "Comment updated successfully.",
            severity: "success",
            placement: "bottom-left",
          });
        }

        if (event.deletedFeatures?.length > 0) {
          enqueueNotification({
            message: "Comment deleted.",
            severity: "info",
            placement: "bottom-left",
          });
        }
      });

      await newCommentLayer.load();

      const missingFields = [
        REGION_FIELD,
        PROVINCE_FIELD,
        LC_NUMBER_FIELD,
      ].filter(
        (name) =>
          !newCommentLayer.fields?.some((field) => field.name === name),
      );

      if (missingFields.length > 0) {
        console.warn(
          "Comment layer is missing field(s) needed for filter defaults:",
          missingFields,
        );
      } else {
        const defaultAttributes: Record<string, any> = {
          [REGION_FIELD]: selectedRegion || null,
          [PROVINCE_FIELD]: selectedProvince || null,
          [LC_NUMBER_FIELD]: lc_number || null,
        };

        const editorFieldName = resolveFieldName(newCommentLayer, "editor");

        if (editorFieldName) {
          defaultAttributes[editorFieldName] = getCurrentUserDisplayName();
        } else {
          console.warn(
            "Comment layer has no recognizable 'editor' field; skipping auto-populated editor default.",
          );
        }

        // Email is pre-filled the same way as Editor, but stays editable
        // (not added to readOnlyFieldNames below) in case the reviewer
        // wants to submit a different contact email than their account's.
        const emailFieldName = resolveFieldName(newCommentLayer, "email");

        if (emailFieldName) {
          defaultAttributes[emailFieldName] = getCurrentUserEmail();
        } else {
          console.warn(
            "Comment layer has no recognizable 'email' field; skipping auto-populated email default.",
          );
        }

        newCommentLayer.templates = [
          {
            name: newCommentLayer.title || "Comment",
            description: "",
            drawingTool:
              DRAWING_TOOL_BY_GEOMETRY_TYPE[newCommentLayer.geometryType] ??
              "esriFeatureEditToolPoint",
            prototype: { attributes: defaultAttributes },
          },
        ];

        // Only show comments that belong to the currently selected LC map.
        const escapeValue = (value: string) => value.replace(/'/g, "''");

        newCommentLayer.definitionExpression = `${REGION_FIELD} = '${escapeValue(selectedRegion)}' AND ${PROVINCE_FIELD} = '${escapeValue(selectedProvince)}' AND ${LC_NUMBER_FIELD} = '${escapeValue(lc_number)}'`;
      }

      // ------------------------------------------------------
      // Editor widget form: keep every EDITABLE field present (nothing
      // required excluded -- that's what fixed "Database error has
      // occurred", caused by omitting a required field), but mark
      // Editor/Region/Province/LC Map Number as read-only so people can
      // see the auto-populated values without being able to change them.
      //
      // Fields the service itself marks non-editable (ObjectID,
      // GlobalID, Shape_Area, Shape_Length, and any other
      // system/calculated field) are excluded via field.editable rather
      // than guessing specific field names or types -- they can't be
      // submitted by a client edit anyway, so leaving them out doesn't
      // risk the same "missing required field" failure.
      // ------------------------------------------------------

      const READ_ONLY_EXPRESSION_NAME = "auto-populated-not-editable";

      const readOnlyFieldNames = new Set(
        ["editor", REGION_FIELD, PROVINCE_FIELD, LC_NUMBER_FIELD]
          .map((candidate) => resolveFieldName(newCommentLayer, candidate))
          .filter((name): name is string => Boolean(name)),
      );

      const formFields = (newCommentLayer.fields ?? []).filter(
        (field) => field.editable !== false,
      );

      newCommentLayer.formTemplate = new FormTemplate({
        title: newCommentLayer.title || "Comment",
        expressionInfos: [
          {
            name: READ_ONLY_EXPRESSION_NAME,
            expression: "false",
            returnType: "boolean",
          },
        ],
        elements: formFields.map((field) => ({
          type: "field",
          fieldName: field.name,
          label: field.alias || field.name,
          ...(readOnlyFieldNames.has(field.name)
            ? { editableExpression: READ_ONLY_EXPRESSION_NAME }
            : {}),
        })),
      });

      // ------------------------------------------------------
      // Popup (click-to-inspect on the map) is a separate concern from
      // the Editor widget's add/edit form above. Without an explicit
      // popupTemplate, ArcGIS appears to reuse formTemplate to build the
      // default popup -- but form-only properties like
      // editableExpression aren't meaningful in a popup, which was
      // making the popup render completely blank. Generating a
      // dedicated popup template from all of the layer's fields keeps
      // clicking a comment on the map showing full details, regardless
      // of what the edit form restricts.
      // ------------------------------------------------------

      newCommentLayer.popupTemplate = newCommentLayer.createPopupTemplate();

      // Add comment layer
      map.add(newCommentLayer);
      setCommentLayer(newCommentLayer);

      // Make sure comments are visible
      newCommentLayer.visible = true;

      // Register Comment Layer with Experience Builder
      await ensureLayerDataSource(newCommentLayer, jimuMapView);

      // 11. Keep comments above LC Map in the layer list
      const commentIndex = map.layers.indexOf(newCommentLayer);

      if (commentIndex !== -1) {
        map.reorder(newCommentLayer, map.layers.length - 1);
      }

      // Arrived here via a feedback comment's "View on Map" button -- zoom
      // in on that specific comment (overriding the wider LC-map-extent
      // zoom above) and open its popup, instead of just leaving the whole
      // LC map in view.
      if (pendingTarget?.objectId) {
        try {
          const targetQuery = newCommentLayer.createQuery();

          targetQuery.objectIds = [pendingTarget.objectId];
          targetQuery.outFields = ["*"];
          targetQuery.returnGeometry = true;

          const targetResult = await newCommentLayer.queryFeatures(targetQuery);
          const targetFeature = targetResult.features[0];

          if (targetFeature?.geometry) {
            const geometry = targetFeature.geometry;

            // Deliberately doesn't also call view.popup.open() here -- on
            // this page's Map widget, opening the popup this way triggered
            // an "arcgis-popup component has already been destroyed" crash
            // during a later page navigation. The zoom below is what was
            // actually asked for; the popup can still be opened by clicking
            // the comment on the map afterward.
            if (geometry.type === "point") {
              await jimuMapView.view.goTo({ target: geometry, zoom: 16 });
            } else if (geometry.extent) {
              await jimuMapView.view.goTo(geometry.extent.expand(1.3));
            } else {
              await jimuMapView.view.goTo(geometry);
            }
          } else {
            console.warn("Could not find the linked comment on the map.");
          }
        } catch (zoomError) {
          console.error("Failed to zoom to the linked comment:", zoomError);
        }
      }

      // Filter succeeded end-to-end -- close the popup so the map is
      // immediately visible. Left open on failure (see catch below) so
      // the user can see what happened and try again.
      setIsFilterOpen(false);
    } catch (error) {
      console.error("FAILED TO LOAD LC MAP OR COMMENTS:", error);
    }
  };

  // ==========================================================
  // "VIEW ON MAP" FROM A FEEDBACK COMMENT
  // ==========================================================

  // view-feedbacks' "View on Map" button leaves a pending target here (see
  // widgets/shared-code/comment-navigation-store) right before navigating
  // to this page. Subscribing (rather than a one-time mount check) handles
  // both cases: this widget already being mounted when the button is
  // clicked (Experience Builder may keep pages mounted across navigation),
  // or mounting fresh afterward.
  useEffect(
    () =>
      subscribeToPendingCommentTarget((target) => {
        setPendingTarget(target);
        setSelectedRegion(target.region);
        setSelectedProvince(target.province);
      }),
    [],
  );

  // Once the pending target's region/province have actually landed in state
  // (a separate render from the effect above, so handleLcNumberChange below
  // closes over the right values) and the catalog/map are ready, select the
  // LC Number the same way a real dropdown click would -- handleLcNumberChange
  // itself then zooms to this specific comment once its layer loads (see the
  // pendingTarget.objectId check further up in that function).
  useEffect(() => {
    if (!pendingTarget) return;
    if (!jimuMapView) return;
    if (lcMaps.length === 0) return;
    if (selectedRegion !== pendingTarget.region) return;
    if (selectedProvince !== pendingTarget.province) return;

    handleLcNumberChange(pendingTarget.lcNumber);
    setPendingTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTarget, jimuMapView, lcMaps, selectedRegion, selectedProvince]);

  // ==========================================================
  // MAP CONNECTION
  // ==========================================================

  const handleActiveViewChange = (mapView: JimuMapView) => {
    setJimuMapView(mapView);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* =====================================================
          CONNECT TO THE MAP WIDGET
          ===================================================== */}

      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={handleActiveViewChange}
      />

      {/* =====================================================
          FILTER: a button that opens the filter as a popup
          ===================================================== */}

      <LayerFilterModal
        isOpen={isFilterOpen}
        onOpen={() => setIsFilterOpen(true)}
        onClose={() => setIsFilterOpen(false)}
        regions={regions}
        provinces={provinces}
        lcMapNumbers={lcMapNumbers}
        selectedRegion={selectedRegion}
        selectedProvince={selectedProvince}
        selectedLcNumber={selectedLcNumber}
        onRegionChange={handleRegionChange}
        onProvinceChange={handleProvinceChange}
        onLcNumberChange={handleLcNumberChange}
      />
    </>
  );
}

export default Widget;
