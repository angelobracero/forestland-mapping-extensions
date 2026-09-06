import { type AllWidgetProps } from "jimu-core";
import { useEffect, useState } from "react";
import { Paper } from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { getFieldValue } from "widgets/shared-code/field-utils";
import { CONTENT_ITEM_ID } from "widgets/shared-code/content-config";

import {
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
  videoGridStyle,
  videoCardStyle,
  videoThumbStyle,
  videoStyle,
  videoInfoStyle,
  videoTitleStyle,
  videoDescStyle,
  emptyStateStyle,
} from "./style";

// About AVPs is table/layer 2 in the shared content item (see
// widgets/shared-code/content-config.ts).
const ABOUT_AVPS_LAYER_ID = 2;

type Avp = {
  title: string;
  description: string;
  video: string;
};

function Widget(props: AllWidgetProps<any>) {
  const [avps, setAvps] = useState<Avp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAvps = async () => {
      setLoading(true);
      setError(null);

      try {
        const layer = new FeatureLayer({
          portalItem: { id: CONTENT_ITEM_ID },
          layerId: ABOUT_AVPS_LAYER_ID,
        });

        await layer.load();

        const query = layer.createQuery();

        query.where = "1=1";
        query.outFields = ["*"];
        query.returnGeometry = false;

        const result = await layer.queryFeatures(query);

        const items: Avp[] = result.features.map((feature) => {
          const attributes = feature.attributes;

          return {
            title: getFieldValue(attributes, "title") ?? "",
            description: getFieldValue(attributes, "description") ?? "",
            video: getFieldValue(attributes, "video_url", "video") ?? "",
          };
        });

        setAvps(items);
      } catch (loadError) {
        console.error("Failed to load About AVPs:", loadError);

        setError("Failed to load About AVPs.");
      } finally {
        setLoading(false);
      }
    };

    loadAvps();
  }, []);

  return (
    <Paper className="jimu-widget" component="main">
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h2 css={titleStyle}>About</h2>
          <div css={dividerStyle} />
          <p css={subtitleStyle}>
            Learn more about the Forestland Evaluation and Mapping Project
            through these audio-visual presentations.
          </p>
        </div>

        {loading ? (
          <div css={emptyStateStyle}>Loading AVPs...</div>
        ) : error ? (
          <div css={emptyStateStyle}>{error}</div>
        ) : avps.length === 0 ? (
          <div css={emptyStateStyle}>No AVPs have been added yet.</div>
        ) : (
          <div css={videoGridStyle}>
            {avps.map((avp, index) => (
              <div key={`${avp.title}-${index}`} css={videoCardStyle}>
                <div css={videoThumbStyle}>
                  <video css={videoStyle} controls>
                    <source src={avp.video} type="video/mp4" />
                  </video>
                </div>
                <div css={videoInfoStyle}>
                  <p css={videoTitleStyle}>{avp.title}</p>
                  <p css={videoDescStyle}>{avp.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Paper>
  );
}

export default Widget;
