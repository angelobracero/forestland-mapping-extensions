import { type AllWidgetProps, getAppStore } from "jimu-core";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { enqueueNotification, Loading } from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import CodedValueDomain from "@arcgis/core/layers/support/CodedValueDomain";
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import { resolveFieldName } from "widgets/shared-code/field-utils";
import {
  LC_MAP_CATALOG_ITEM_ID,
  OFFICE_OPTIONS_TABLE_ITEM_ID,
} from "widgets/shared-code/content-config";
import { PHILIPPINE_REGIONS } from "widgets/shared-code/philippine-regions";
import { setCurrentLcMapLayer } from "widgets/shared-code/local-layers-store";
import {
  type PendingCommentTarget,
  subscribeToPendingCommentTarget,
} from "widgets/shared-code/comment-navigation-store";
import { subscribeToPendingRegionTarget } from "widgets/shared-code/region-navigation-store";
import { ensureLayerDataSource } from "./map-utils";
import { LayerFilterModal } from "./components/LayerFilterModal";
import { mapLoadingOverlayStyle } from "./style";

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

// Rows managed by content-admin's "Office Options" tab -- each row's `label`
// becomes one choice in the comment form's Office dropdown below. "Others"
// isn't a row here; it's always appended in code, since picking it also
// reveals the office_other free-text field.
const officeOptionsLayer = new FeatureLayer({
  portalItem: {
    id: OFFICE_OPTIONS_TABLE_ITEM_ID,
  },
});

const OTHERS_OFFICE_OPTION = "Others";

const COMMENT_LAYER_PORTAL_ITEM_ID = "f534c711fbdb4837a74ee79de867ffa4";

// NOTE: these must exactly match the field names (including case) on the
// comment feature layer in AGOL. Update these constants if you name the
// fields differently there.
const REGION_FIELD = "region";
const PROVINCE_FIELD = "province";
const LC_NUMBER_FIELD = "lc_number";
const OFFICE_FIELD = "office";
const OFFICE_OTHER_FIELD = "office_other";

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
  const [officeOptions, setOfficeOptions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedLcNumber, setSelectedLcNumber] = useState<string>("");
  const [jimuMapView, setJimuMapView] = useState<JimuMapView | null>(null);
  const [currentLcLayer, setCurrentLcLayer] = useState<FeatureLayer | null>(
    null,
  );
  const [commentLayer, setCommentLayer] = useState<FeatureLayer | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Covers the whole map while handleLcNumberChange below is loading the
  // selected LC Map + comment layer -- both the "pick a Region/Province,
  // then an LC Number" flow and the "View on Map" comment flow end up
  // calling that same function.
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<PendingCommentTarget | null>(
    null,
  );
  // Handle for the map highlight placed on a comment linked in from
  // view-feedbacks (see pendingTarget.objectId below) -- kept in a ref so
  // it can be cleared before adding a new one.
  const commentHighlightHandleRef = useRef<{ remove: () => void } | null>(null);

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

  // LOAD OFFICE OPTIONS (see content-admin's "Office Options" tab)
  useEffect(() => {
    const loadOfficeOptions = async () => {
      try {
        await officeOptionsLayer.load();

        const query = officeOptionsLayer.createQuery();

        query.outFields = ["label"];
        query.returnGeometry = false;

        const result = await officeOptionsLayer.queryFeatures(query);

        setOfficeOptions(
          result.features
            .map((feature) => feature.attributes.label)
            .filter((label): label is string => Boolean(label)),
        );
      } catch (error) {
        console.error("Failed to load Office options:", error);
      }
    };

    loadOfficeOptions();
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

    // Close the filter popup right away so the map is immediately visible
    // instead of sitting behind it while the layer loads -- there's no
    // visible error state to preserve below anyway (failures only go to
    // the console), so there's no reason to keep it open that long.
    setIsFilterOpen(false);

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

    setIsMapLoading(true);

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

      commentHighlightHandleRef.current?.remove();
      commentHighlightHandleRef.current = null;

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

      // Restricts the Office field to a dropdown (content-admin's "Office
      // Options" table + "Others" always last) instead of the free-text
      // input it'd otherwise get -- assigning a domain client-side like
      // this doesn't touch the field's actual schema, just how this layer's
      // own forms/popups present it.
      const officeField = newCommentLayer.fields?.find(
        (field) => field.name === OFFICE_FIELD,
      );

      if (officeField) {
        officeField.domain = new CodedValueDomain({
          name: OFFICE_FIELD,
          codedValues: [...officeOptions, OTHERS_OFFICE_OPTION].map((option) => ({
            name: option,
            code: option,
          })),
        });
      } else {
        console.warn(
          `Comment layer has no "${OFFICE_FIELD}" field; skipping the Office dropdown.`,
        );
      }

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

      // Only shows office_other once "Others" is picked in the Office
      // dropdown above -- re-evaluated live as the visitor fills the form
      // in, same as any other Arcade-driven form rule.
      const OFFICE_OTHER_VISIBLE_EXPRESSION_NAME = "office-is-others";

      const readOnlyFieldNames = new Set(
        ["editor", REGION_FIELD, PROVINCE_FIELD, LC_NUMBER_FIELD]
          .map((candidate) => resolveFieldName(newCommentLayer, candidate))
          .filter((name): name is string => Boolean(name)),
      );

      // office_other otherwise lands wherever it happens to sit in the
      // layer's own schema order (last, since it was added most recently)
      // -- moved here to sit right after office instead, so the "please
      // specify" box appears directly under the dropdown that reveals it.
      const formFields = (newCommentLayer.fields ?? []).filter(
        (field) => field.editable !== false,
      );
      const officeOtherFieldIndex = formFields.findIndex(
        (field) => field.name === OFFICE_OTHER_FIELD,
      );
      const officeFieldIndex = formFields.findIndex(
        (field) => field.name === OFFICE_FIELD,
      );

      if (officeOtherFieldIndex !== -1 && officeFieldIndex !== -1) {
        const [officeOtherField] = formFields.splice(officeOtherFieldIndex, 1);

        formFields.splice(
          // The office field's own index shifts down by one if
          // office_other sat earlier in the array than it did.
          officeFieldIndex - (officeOtherFieldIndex < officeFieldIndex ? 1 : 0) + 1,
          0,
          officeOtherField,
        );
      }

      newCommentLayer.formTemplate = new FormTemplate({
        title: newCommentLayer.title || "Comment",
        expressionInfos: [
          {
            name: READ_ONLY_EXPRESSION_NAME,
            expression: "false",
            returnType: "boolean",
          },
          {
            name: OFFICE_OTHER_VISIBLE_EXPRESSION_NAME,
            expression: `$feature.${OFFICE_FIELD} == '${OTHERS_OFFICE_OPTION}'`,
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
          ...(field.name === OFFICE_OTHER_FIELD
            ? { visibilityExpression: OFFICE_OTHER_VISIBLE_EXPRESSION_NAME }
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

            // Deliberately doesn't call view.popup.open() here -- on this
            // page's Map widget, opening the popup this way triggered an
            // "arcgis-popup component has already been destroyed" crash
            // during a later page navigation. A layer highlight achieves
            // the same "this one is selected" effect without touching the
            // Popup UI component at all, so it doesn't have that problem.
            if (geometry.type === "point") {
              await jimuMapView.view.goTo({ target: geometry, zoom: 16 });
            } else if (geometry.extent) {
              await jimuMapView.view.goTo(geometry.extent.expand(1.3));
            } else {
              await jimuMapView.view.goTo(geometry);
            }

            const commentLayerView =
              await jimuMapView.view.whenLayerView(newCommentLayer);

            commentHighlightHandleRef.current = commentLayerView.highlight(
              pendingTarget.objectId,
            );
          } else {
            console.warn("Could not find the linked comment on the map.");
          }
        } catch (zoomError) {
          console.error("Failed to zoom to the linked comment:", zoomError);
        }
      }

    } catch (error) {
      console.error("FAILED TO LOAD LC MAP OR COMMENTS:", error);
    } finally {
      setIsMapLoading(false);
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

  // forestland-menu's sidebar (see widgets/shared-code/region-navigation-store)
  // leaves a Region/Province here right before navigating, then this opens
  // the filter popup with those two pre-selected -- LC Map Number is left
  // blank for the visitor to pick themselves, unlike the comment-target flow
  // above which also pins an exact LC Map Number and zooms to a comment.
  useEffect(
    () =>
      subscribeToPendingRegionTarget((target) => {
        setSelectedRegion(target.region);
        setSelectedProvince(target.province);
        // Otherwise a map picked for a previous Region/Province could stay
        // selected (and shown on the map) even though it no longer matches
        // the newly-arrived Region/Province.
        setSelectedLcNumber("");
        setIsFilterOpen(true);
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

  // Clears the "linked from a feedback comment" highlight (see
  // handleLcNumberChange's pendingTarget.objectId block above) as soon as
  // the user clicks anywhere else on the map, so it behaves like a normal
  // selection instead of a marker that's stuck there permanently.
  useEffect(() => {
    if (!jimuMapView) return;

    const clickHandle = jimuMapView.view.on("click", () => {
      commentHighlightHandleRef.current?.remove();
      commentHighlightHandleRef.current = null;
    });

    return () => clickHandle.remove();
  }, [jimuMapView]);

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

      {/* =====================================================
          LOADING OVERLAY: shown while handleLcNumberChange is
          loading the selected LC Map + comment layer.
          ===================================================== */}

      {isMapLoading &&
        createPortal(
          // Rendered straight to <body> (instead of wherever this widget
          // sits in Experience Builder's own layout containers) so this
          // "fixed" overlay actually covers the whole screen -- including
          // the sidebar -- rather than being trapped inside one layout
          // panel. Also blocks clicking to a different province/comment
          // mid-load, which would otherwise race two loads against
          // each other.
          <div css={mapLoadingOverlayStyle}>
            <Loading text="Loading map…" />
          </div>,
          document.body,
        )}
    </>
  );
}

export default Widget;
