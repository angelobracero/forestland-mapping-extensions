import { type AllWidgetProps } from "jimu-core";
import { useEffect, useState } from "react";
import { Paper, Select, Option } from "jimu-ui";

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import esriConfig from "@arcgis/core/config";

import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";

import {
  filterContainerStyle,
  regionFilterStyle,
  provinceFilterStyle,
  titleStyle,
} from "./style";

type LcMap = {
  region: string;
  province: string;
  lc_number: string;
  item_id: string;
};

esriConfig.portalUrl = "https://geospatial.namria.gov.ph/portal";

const catalogLayer = new FeatureLayer({
  portalItem: {
    id: "7fb9324349ae4c01b4efcb06d09e79ce",
  },
});

const commentLayer = new FeatureLayer({
  portalItem: {
    id: "f534c711fbdb4837a74ee79de867ffa4",
  },
});

function Widget(props: AllWidgetProps<any>) {
  const [lcMaps, setLcMaps] = useState<LcMap[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedLcNumber, setSelectedLcNumber] = useState<string>("");
  const [jimuMapView, setJimuMapView] = useState<JimuMapView | null>(null);
  const [currentLcLayer, setCurrentLcLayer] = useState<FeatureLayer | null>(
    null,
  );

  // ==========================================================
  // LOAD LC MAP CATALOG
  // ==========================================================

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        console.log("Loading LC Map catalog...");

        await catalogLayer.load();

        const query = catalogLayer.createQuery();

        query.where = "1=1";
        query.outFields = ["region", "province", "item_id"];
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

  // ==========================================================
  // REGION CHANGE
  // ==========================================================

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedProvince("");
  };

  // ==========================================================
  // PROVINCE CHANGE
  // ==========================================================

  const handleProvinceChange = async (province: string) => {
    setSelectedProvince(province);
    setSelectedLcNumber("");
  };

  // ==========================================================
  // LC NUMBER CHANGE
  // ==========================================================

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

      // ======================================================
      // 2. CREATE LC MAP
      // ======================================================

      const lcLayer = new FeatureLayer({
        portalItem: {
          id: selectedMap.item_id,
        },
      });

      // ======================================================
      // 3. LOAD LC MAP
      // ======================================================

      await lcLayer.load();

      console.log("LC Map loaded:", lcLayer.title);

      // ======================================================
      // 4. ADD LC MAP TO EXISTING MAP
      // ======================================================

      map.add(lcLayer);

      setCurrentLcLayer(lcLayer);

      console.log("LC Map added:", lcLayer.title);

      // ======================================================
      // 5. REGISTER LC MAP WITH EXPERIENCE BUILDER
      //
      // This allows other Experience Builder widgets to
      // recognize the runtime layer.
      // ======================================================

      await ensureLayerDataSource(lcLayer);

      // ======================================================
      // 6. ZOOM TO LC MAP
      // ======================================================

      if (lcLayer.fullExtent) {
        await jimuMapView.view.goTo(lcLayer.fullExtent.expand(1.05));

        console.log("Zoomed to LC Map.");
      }

      // ======================================================
      // 7. LOAD COMMENT LAYER
      // ======================================================

      await commentLayer.load();

      console.log("Comment layer loaded:", commentLayer.title);

      // ======================================================
      // 8. FILTER COMMENTS
      // ======================================================

      const escapedLcNumber = lc_number.replace(/'/g, "''");

      commentLayer.definitionExpression = `lc_number = '${escapedLcNumber}'`;

      console.log(
        "Comment definition expression:",
        commentLayer.definitionExpression,
      );

      // ======================================================
      // 9. ADD COMMENT LAYER
      // ======================================================

      if (!map.layers.includes(commentLayer)) {
        map.add(commentLayer);

        console.log("Comment layer added.");
      } else {
        console.log("Comment layer already exists.");
      }

      // Make sure comments are visible
      commentLayer.visible = true;

      // ======================================================
      // 10. REGISTER COMMENT LAYER WITH EXPERIENCE BUILDER
      //
      // THIS IS THE MOST IMPORTANT PART FOR EDITING.
      // ======================================================

      await ensureLayerDataSource(commentLayer);

      // ======================================================
      // 11. KEEP COMMENTS ABOVE LC MAP
      // ======================================================

      const commentIndex = map.layers.indexOf(commentLayer);

      if (commentIndex !== -1) {
        map.reorder(commentLayer, map.layers.length - 1);
      }

      // ======================================================
      // COMPLETE
      // ======================================================

      console.log("================================");

      console.log("LC NUMBER LOAD COMPLETE");

      console.log("LC Number:", lc_number);

      console.log("LC Map:", lcLayer.title);

      console.log("Comments:", commentLayer.title);

      console.log("================================");
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

      <Paper className="jimu-widget" component="div">
        <div css={titleStyle}>Filter</div>

        <div css={filterContainerStyle}>
          {/* =================================================
              REGION
              ================================================= */}

          <div css={regionFilterStyle}>
            <label>Region</label>

            <Select
              value={selectedRegion}
              onChange={(event) => {
                handleRegionChange(event.target.value);
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

          <div css={provinceFilterStyle}>
            <label>Province</label>

            <Select
              value={selectedProvince}
              disabled={!selectedRegion}
              onChange={(event) => {
                handleProvinceChange(event.target.value);
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

          <div css={provinceFilterStyle}>
            <label>Lc Map Number</label>

            <Select
              value={selectedLcNumber}
              disabled={!selectedRegion}
              onChange={(event) => {
                handleLcNumberChange(event.target.value);
              }}
              placeholder="Select a Lc Map Number"
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
