import { type AllWidgetProps } from "jimu-core";
import { useEffect, useState } from "react";
import { Paper } from "jimu-ui";

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
  overlayCloseButtonStyle,
} from "./style";

type MediaItem = {
  type: "image" | "video";
  title?: string;
  date: string;
  media?: string;
};

const mediaDatabaseLink = "https://files.angelobracero.com/lcd-page";

function Widget(props: AllWidgetProps<any>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const mediaItems: MediaItem[] = [
    {
      type: "video",
      title: "LC Survey Fieldwork in Nueva Vizcaya",
      date: "August 15, 2026",
      media: `${mediaDatabaseLink}/20260815_130040.mp4`,
    },
    {
      type: "video",
      title: "Boundary Validation Walkthrough",
      date: "August 15, 2026",
      media: `${mediaDatabaseLink}/20260815_130307.mp4`,
    },
    {
      type: "image",
      title: "Technical Mapping Session",
      date: "August 17, 2026",
      media: `${mediaDatabaseLink}/20260817_102958.jpg`,
    },
    {
      type: "video",
      title: "Community Consultation Meeting",
      date: "August 17, 2026",
      media: `${mediaDatabaseLink}/20260817_104540.mp4`,
    },
    {
      type: "video",
      title: "LC Survey Team in the Field",
      date: "August 17, 2026",
      media: `${mediaDatabaseLink}/20260817_111149.mp4`,
    },
    {
      type: "video",
      title: "Ground Truthing Activity",
      date: "August 20, 2026",
      media: `${mediaDatabaseLink}/20260820_104835.mp4`,
    },
    {
      type: "video",
      title: "LCD Staff Conducting GPS Survey",
      date: "August 22, 2026",
      media: `${mediaDatabaseLink}/20260822_174359_073.mp4`,
    },
    {
      type: "image",
      title: "Overview of the LC Mapping Process",
      date: "August 15, 2026",
      media: `${mediaDatabaseLink}/DSC00927.jpg`,
    },
  ];

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
                  {item.title && (
                    <p css={captionTitleStyle}>{item.title}</p>
                  )}
                  <div css={captionDateStyle}>{item.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedItem && (
        <div css={overlayStyle} onClick={() => setSelectedIndex(null)}>
          <button
            css={overlayCloseButtonStyle}
            aria-label="Close"
            onClick={() => setSelectedIndex(null)}
          >
            &times;
          </button>

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
