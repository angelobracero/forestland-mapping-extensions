import { type AllWidgetProps } from "jimu-core";
import { useEffect, useState } from "react";
import { Paper } from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { getFieldValue, formatDateLong } from "widgets/shared-code/field-utils";
import { CONTENT_ITEM_ID } from "widgets/shared-code/content-config";

import {
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
  gridStyle,
  cardStyle,
  clickableCardStyle,
  mediaWrapperStyle,
  imageStyle,
  videoThumbStyle,
  typeBadgeStyle,
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

// LCD in Action media is table/layer 1 in the shared content item (see
// widgets/shared-code/content-config.ts).
const LCD_MEDIA_LAYER_ID = 1;

type MediaItem = {
  type: "image" | "video";
  title?: string;
  date: string;
  media?: string;
};

// media_type is free text on the table ("image"/"video"); normalize it so
// a stray typo or different casing doesn't just fall through to "video".
function normalizeMediaType(rawValue: unknown): "image" | "video" {
  return String(rawValue ?? "").trim().toLowerCase() === "image"
    ? "image"
    : "video";
}

function Widget(props: AllWidgetProps<any>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMediaItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const layer = new FeatureLayer({
          portalItem: { id: CONTENT_ITEM_ID },
          layerId: LCD_MEDIA_LAYER_ID,
        });

        await layer.load();

        const query = layer.createQuery();

        query.where = "1=1";
        query.outFields = ["*"];
        query.returnGeometry = false;

        const result = await layer.queryFeatures(query);

        const items: MediaItem[] = result.features.map((feature) => {
          const attributes = feature.attributes;

          return {
            type: normalizeMediaType(getFieldValue(attributes, "media_type")),
            title: getFieldValue(attributes, "title") || undefined,
            date: formatDateLong(
              getFieldValue(attributes, "media_date", "date"),
            ),
            media: getFieldValue(attributes, "media_url", "media") ?? "",
          };
        });

        setMediaItems(items);
      } catch (loadError) {
        console.error("Failed to load LCD in Action media:", loadError);

        setError("Failed to load LCD in Action media.");
      } finally {
        setLoading(false);
      }
    };

    loadMediaItems();
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

  const selectedItem =
    selectedIndex !== null ? mediaItems[selectedIndex] : null;

  return (
    <Paper className="jimu-widget" component="main">
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h2 css={titleStyle}>LCD in Action</h2>
          <div css={dividerStyle} />
          <p css={subtitleStyle}>
            Photos and videos from the Land Classification Division's fieldwork,
            surveys, and community engagements.
          </p>
        </div>

        {loading ? (
          <div css={emptyStateStyle}>Loading media...</div>
        ) : error ? (
          <div css={emptyStateStyle}>{error}</div>
        ) : mediaItems.length === 0 ? (
          <div css={emptyStateStyle}>No media has been added yet.</div>
        ) : (
          <div css={gridStyle}>
            {mediaItems.map((item, index) => {
              const isPhoto = item.type === "image";

              return (
                <div
                  key={`${item.title ?? "media"}-${index}`}
                  css={[cardStyle, isPhoto && clickableCardStyle]}
                  onClick={isPhoto ? () => setSelectedIndex(index) : undefined}
                >
                  <div css={mediaWrapperStyle}>
                    <span css={typeBadgeStyle}>
                      {isPhoto ? "\u{1F4F7} Photo" : "\u{1F3AC} Video"}
                    </span>

                    {isPhoto ? (
                      <img
                        css={imageStyle}
                        src={item.media}
                        alt={item.title || "LCD in Action photo"}
                      />
                    ) : (
                      <div css={videoThumbStyle}>
                        <video controls>
                          <source src={item.media} type="video/mp4" />
                        </video>
                      </div>
                    )}
                  </div>
                  <div css={captionStyle}>
                    {item.title && <p css={captionTitleStyle}>{item.title}</p>}
                    <div css={captionDateStyle}>{item.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedItem && (
        <div css={overlayStyle} onClick={() => setSelectedIndex(null)}>
          <img
            css={overlayImageStyle}
            src={selectedItem.media}
            alt={selectedItem.title || "LCD in Action photo"}
            onClick={(e) => e.stopPropagation()}
          />

          <div css={overlayCaptionStyle}>
            {selectedItem.title && (
              <p css={overlayCaptionTitleStyle}>{selectedItem.title}</p>
            )}
            <div css={overlayCaptionDateStyle}>{selectedItem.date}</div>
          </div>
        </div>
      )}
    </Paper>
  );
}

export default Widget;
