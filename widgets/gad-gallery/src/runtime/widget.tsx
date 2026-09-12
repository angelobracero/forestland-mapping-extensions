import { type AllWidgetProps } from "jimu-core";
import { useEffect, useState } from "react";
import { Paper } from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { getFieldValue, formatDateLong, resolveFieldName } from "widgets/shared-code/field-utils";
import { CONTENT_ITEM_ID } from "widgets/shared-code/content-config";

import {
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
  gridStyle,
  cardStyle,
  imageWrapperStyle,
  imageStyle,
  captionStyle,
  captionTitleStyle,
  captionDateStyle,
  overlayStyle,
  overlayImageStyle,
  overlayCaptionStyle,
  overlayCaptionTitleStyle,
  overlayCaptionDateStyle,
  emptyStateStyle,
} from "./style";

// GAD activities is table/layer 0 in the shared content item (see
// widgets/shared-code/content-config.ts).
const GAD_ACTIVITIES_LAYER_ID = 0;

type Activity = {
  title?: string;
  date: string;
  image: string;
};

function Widget(props: AllWidgetProps<any>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      setError(null);

      try {
        const layer = new FeatureLayer({
          portalItem: { id: CONTENT_ITEM_ID },
          layerId: GAD_ACTIVITIES_LAYER_ID,
        });

        await layer.load();

        const query = layer.createQuery();

        query.where = "1=1";
        query.outFields = ["*"];
        query.returnGeometry = false;

        // Matches the order set via content-admin's drag-to-reorder GAD
        // tab -- falls back to whatever the service returns by default if
        // this field doesn't exist yet.
        const sortFieldName = resolveFieldName(layer, "sort_order");

        if (sortFieldName) {
          query.orderByFields = [`${sortFieldName} ASC`];
        }

        const result = await layer.queryFeatures(query);

        const items: Activity[] = result.features.map((feature) => {
          const attributes = feature.attributes;

          return {
            title: getFieldValue(attributes, "title") || undefined,
            date: formatDateLong(
              getFieldValue(attributes, "activity_date", "date"),
            ),
            image: getFieldValue(attributes, "image_url", "image") ?? "",
          };
        });

        setActivities(items);
      } catch (loadError) {
        console.error("Failed to load GAD activities:", loadError);

        setError("Failed to load GAD activities.");
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex]);

  const selectedActivity =
    selectedIndex !== null ? activities[selectedIndex] : null;

  return (
    <Paper className="jimu-widget" component="main">
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h2 css={titleStyle}>LCD GAD Activities</h2>
          <div css={dividerStyle} />
          <p css={subtitleStyle}>
            A look at the Gender and Development (GAD) initiatives of the Land
            Classification Division, including trainings, workshops, and
            outreach activities.
          </p>
        </div>

        {loading ? (
          <div css={emptyStateStyle}>Loading activities...</div>
        ) : error ? (
          <div css={emptyStateStyle}>{error}</div>
        ) : activities.length === 0 ? (
          <div css={emptyStateStyle}>No activities have been added yet.</div>
        ) : (
          <div css={gridStyle}>
            {activities.map((activity, index) => (
              <div
                key={`${activity.title ?? "activity"}-${index}`}
                css={cardStyle}
                onClick={() => setSelectedIndex(index)}
              >
                <div css={imageWrapperStyle}>
                  <img
                    css={imageStyle}
                    src={activity.image}
                    alt={activity.title || "LCD GAD activity"}
                  />
                </div>
                <div css={captionStyle}>
                  {activity.title && (
                    <p css={captionTitleStyle}>{activity.title}</p>
                  )}
                  <div css={captionDateStyle}>{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedActivity && (
        <div css={overlayStyle} onClick={() => setSelectedIndex(null)}>
          <img
            css={overlayImageStyle}
            src={selectedActivity.image}
            alt={selectedActivity.title || "LCD GAD activity"}
            onClick={(e) => e.stopPropagation()}
          />

          <div css={overlayCaptionStyle}>
            {selectedActivity.title && (
              <p css={overlayCaptionTitleStyle}>{selectedActivity.title}</p>
            )}
            <div css={overlayCaptionDateStyle}>{selectedActivity.date}</div>
          </div>
        </div>
      )}
    </Paper>
  );
}

export default Widget;
