import { type AllWidgetProps, getAppStore } from "jimu-core";
import { useEffect, useState } from "react";
import { Paper, Select, Option, enqueueNotification } from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";

import {
  filterPanelStyle,
  titleStyle,
  filterContainerStyle,
  fieldStyle,
  fieldLabelStyle,
} from "./style";

type LcMap = {
  region: string;
  province: string;
  lc_number: string;
  item_id: string;
};

const catalogLayer = new FeatureLayer({
  portalItem: {
    id: "7fb9324349ae4c01b4efcb06d09e79ce",
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

// The "Editor" field's exact casing on the comment layer isn't confirmed
// (unlike region/province/lc_number), so look it up case- and
// punctuation-insensitively instead of guessing.
function resolveFieldName(
  layer: FeatureLayer,
  ...candidates: string[]
): string | undefined {
  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedCandidates = candidates.map(normalize);

  return layer.fields?.find((field) =>
    normalizedCandidates.includes(normalize(field.name)),
  )?.name;
}

function getCurrentUserDisplayName(): string | null {
  const user = getAppStore().getState().portalSelf?.user;

  return user?.fullName || user?.username || null;
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

  // LOAD LC MAPS
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        console.log("Loading LC Map catalog...");

        await catalogLayer.load();

        const query = catalogLayer.createQuery();

        query.where = "1=1";
        query.outFields = ["region", "province", "lc_number", "item_id"];
        query.returnGeometry = false;

        const result = await catalogLayer.queryFeatures(query);

        const maps: LcMap[] = result.features.map((feature) => ({
          region: feature.attributes.region,
          province: feature.attributes.province,
          lc_number: feature.attributes.lc_number,
          item_id: feature.attributes.item_id,
        }));

        console.log("LC Map Catalog:", maps);

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

  const regions = [...new Set(lcMaps.map((map) => map.region))];

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

  // ==========================================================
  // EXPERIENCE BUILDER DATA SOURCE
  // ==========================================================

  const ensureLayerDataSource = async (layer: FeatureLayer) => {
    if (!jimuMapView) {
      console.warn(
        "Cannot create data source because JimuMapView is unavailable.",
      );

      return;
    }

    try {
      console.log("Looking for JimuLayerView:", layer.title);

      let jimuLayerView = jimuMapView.getJimuLayerViewByAPILayer(layer);

      if (jimuLayerView) {
        console.log("JimuLayerView already exists:", layer.title);
      }

      if (!jimuLayerView) {
        console.log("JimuLayerView not ready yet. Waiting...");

        await new Promise<void>((resolve) => {
          let finished = false;

          const listener = (createdLayerView: any) => {
            if (createdLayerView?.layer === layer) {
              console.log("JimuLayerView CREATED:", layer.title);

              jimuLayerView = createdLayerView;

              if (!finished) {
                finished = true;

                jimuMapView.removeJimuLayerViewCreatedListener(listener);

                resolve();
              }
            }
          };

          jimuMapView.addJimuLayerViewCreatedListener(listener);

          // --------------------------------------------------
          // Safety timeout
          // --------------------------------------------------

          setTimeout(() => {
            if (!finished) {
              finished = true;

              jimuMapView.removeJimuLayerViewCreatedListener(listener);

              resolve();
            }
          }, 10000);
        });
      }

      // ------------------------------------------------------
      // THIRD: check one more time
      // ------------------------------------------------------

      if (!jimuLayerView) {
        jimuLayerView = jimuMapView.getJimuLayerViewByAPILayer(layer);
      }

      if (!jimuLayerView) {
        console.warn("JimuLayerView could not be created:", layer.title);

        return;
      }

      console.log("JimuLayerView found:", jimuLayerView);
      console.log("JimuLayerView ID:", jimuLayerView.id);
      console.log("Layer Data Source ID:", jimuLayerView.layerDataSourceId);
      console.log("From Runtime:", jimuLayerView.fromRuntime);

      // ------------------------------------------------------
      // FOURTH: CREATE EXPERIENCE BUILDER DATA SOURCE
      // ------------------------------------------------------

      let dataSource = jimuLayerView.getLayerDataSource();

      if (dataSource) {
        console.log(
          "Existing Experience Builder data source found:",
          dataSource.id,
        );
      } else {
        console.log("Creating Experience Builder data source...");

        dataSource = await jimuLayerView.createLayerDataSource();

        console.log("Experience Builder data source CREATED:", dataSource?.id);
      }

      if (!dataSource) {
        console.warn("No data source was created for:", layer.title);

        return;
      }

      console.log(
        "Layer is now registered with Experience Builder:",
        layer.title,
      );

      console.log("Data Source ID:", dataSource.id);
    } catch (error) {
      console.error(
        "Failed to create Experience Builder data source for:",
        layer.title,
        error,
      );
    }
  };

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
    console.log("================================");
    console.log("Region selected:", selectedRegion);
    console.log("Province selected:", selectedProvince);
    console.log("LC Number selected:", lc_number);

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

    console.log("Selected LC Map:", selectedMap);
    console.log("LC Map Item ID:", selectedMap.item_id);

    try {
      if (currentLcLayer) {
        console.log("Removing previous LC map:", currentLcLayer.title);

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
      console.log("LC Map loaded:", lcLayer.title);

      // Add lc map to the map
      map.add(lcLayer);
      setCurrentLcLayer(lcLayer);
      console.log("LC Map added:", lcLayer.title);

      // Register LC Map with Experience Builder
      await ensureLayerDataSource(lcLayer);

      // Zoom to LC Map extent
      if (lcLayer.fullExtent) {
        await jimuMapView.view.goTo(lcLayer.fullExtent.expand(1.05));

        console.log("Zoomed to LC Map.");
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
        console.log("Removing previous comment layer:", commentLayer.title);

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
      console.log("Comment layer loaded:", newCommentLayer.title);

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

        console.log(
          "Comment layer default attributes set:",
          defaultAttributes,
        );

        // Only show comments that belong to the currently selected LC map.
        const escapeValue = (value: string) => value.replace(/'/g, "''");

        newCommentLayer.definitionExpression = `${REGION_FIELD} = '${escapeValue(selectedRegion)}' AND ${PROVINCE_FIELD} = '${escapeValue(selectedProvince)}' AND ${LC_NUMBER_FIELD} = '${escapeValue(lc_number)}'`;

        console.log(
          "Comment layer definition expression:",
          newCommentLayer.definitionExpression,
        );
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
      console.log("Comment layer added.");

      // Make sure comments are visible
      newCommentLayer.visible = true;

      // Register Comment Layer with Experience Builder
      await ensureLayerDataSource(newCommentLayer);

      // 11. Keep comments above LC Map in the layer list
      const commentIndex = map.layers.indexOf(newCommentLayer);

      if (commentIndex !== -1) {
        map.reorder(newCommentLayer, map.layers.length - 1);
      }

      // Check
      console.log("");
      console.log("================================");
      console.log("LC NUMBER LOAD COMPLETE");
      console.log("LC Number:", lc_number);
      console.log("LC Map:", lcLayer.title);
      console.log("Comments:", newCommentLayer.title);
      console.log("================================");
      console.log("");
    } catch (error) {
      console.error("FAILED TO LOAD LC MAP OR COMMENTS:", error);
    }
  };

  // ==========================================================
  // MAP CONNECTION
  // ==========================================================

  const handleActiveViewChange = (mapView: JimuMapView) => {
    console.log("JimuMapView connected:", mapView);

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
          FILTER
          ===================================================== */}

      <Paper css={filterPanelStyle} className="jimu-widget" component="div">
        <div css={titleStyle}>Filter</div>

        <div css={filterContainerStyle}>
          {/* =================================================
              REGION
              ================================================= */}

          <div css={fieldStyle}>
            <label css={fieldLabelStyle}>Region</label>

            <Select
              value={selectedRegion}
              onChange={(e) => {
                handleRegionChange(e.target.value);
              }}
              placeholder="Select a Region"
            >
              {regions.map((region) => (
                <Option key={region} value={region}>
                  {region}
                </Option>
              ))}
            </Select>
          </div>

          {/* =================================================
              PROVINCE
              ================================================= */}

          <div css={fieldStyle}>
            <label css={fieldLabelStyle}>Province</label>

            <Select
              value={selectedProvince}
              disabled={!selectedRegion}
              onChange={(e) => {
                handleProvinceChange(e.target.value);
              }}
              placeholder="Select a Province"
            >
              {provinces.map((province) => (
                <Option key={province} value={province}>
                  {province}
                </Option>
              ))}
            </Select>
          </div>

          {/* =================================================
              LC MAP NUMBER
              ================================================= */}

          <div css={fieldStyle}>
            <label css={fieldLabelStyle}>LC Map Number</label>

            <Select
              value={selectedLcNumber}
              disabled={!selectedRegion}
              onChange={(e) => {
                handleLcNumberChange(e.target.value);
              }}
              placeholder="Select a LC Map Number"
            >
              {lcMapNumbers.map((number) => (
                <Option key={number} value={number}>
                  {number}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Paper>
    </>
  );
}

export default Widget;
