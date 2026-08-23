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
  playButtonStyle,
  videoPlaceholderLabelStyle,
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
  type: "photo" | "video";
  title: string;
  date: string;
  image?: string;
};

// TODO: replace these placeholder photos/videos and captions with the
// actual LCD in Action photos and videos once they're available. Photo
// items use picsum.photos placeholders (click to zoom); video items use
// a placeholder thumbnail since there's no real video to embed yet.
const mediaItems: MediaItem[] = [
  {
    type: "photo",
    title: "LC Survey Fieldwork in Nueva Vizcaya",
    date: "March 2025",
    image: "https://picsum.photos/seed/lcd-1/600/450",
  },
  {
    type: "video",
    title: "Boundary Validation Walkthrough",
    date: "April 2025",
  },
  {
    type: "photo",
    title: "Technical Mapping Session",
    date: "April 2025",
    image: "https://picsum.photos/seed/lcd-2/600/450",
  },
  {
    type: "photo",
    title: "Community Consultation Meeting",
    date: "May 2025",
    image: "https://picsum.photos/seed/lcd-3/600/450",
  },
  {
    type: "video",
    title: "LC Survey Team in the Field",
    date: "May 2025",
  },
  {
    type: "photo",
    title: "Ground Truthing Activity",
    date: "June 2025",
    image: "https://picsum.photos/seed/lcd-4/600/450",
  },
  {
    type: "photo",
    title: "LCD Staff Conducting GPS Survey",
    date: "June 2025",
    image: "https://picsum.photos/seed/lcd-5/600/450",
  },
  {
    type: "video",
    title: "Overview of the LC Mapping Process",
    date: "July 2025",
  },
];

function Widget(props: AllWidgetProps<any>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
            Photos and videos from the Land Classification Division's
            fieldwork, surveys, and community engagements.
          </p>
        </div>

        <div css={gridStyle}>
          {mediaItems.map((item, index) => {
            const isPhoto = item.type === "photo";

            return (
              <div
                key={`${item.title}-${index}`}
                css={[cardStyle, isPhoto && clickableCardStyle]}
                onClick={isPhoto ? () => setSelectedIndex(index) : undefined}
              >
                <div css={mediaWrapperStyle}>
                  <span css={typeBadgeStyle}>
                    {isPhoto ? "\u{1F4F7} Photo" : "\u{1F3AC} Video"}
                  </span>

                  {isPhoto ? (
                    <img css={imageStyle} src={item.image} alt={item.title} />
                  ) : (
                    <div css={videoThumbStyle}>
                      <span css={playButtonStyle}>&#9658;</span>
                      <span css={videoPlaceholderLabelStyle}>
                        Placeholder video
                      </span>
                    </div>
                  )}
                </div>
                <div css={captionStyle}>
                  <p css={captionTitleStyle}>{item.title}</p>
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
            src={selectedItem.image}
            alt={selectedItem.title}
            onClick={(e) => e.stopPropagation()}
          />

          <div css={overlayCaptionStyle}>
            <p css={overlayCaptionTitleStyle}>{selectedItem.title}</p>
            <div css={overlayCaptionDateStyle}>{selectedItem.date}</div>
          </div>
        </div>
      )}
    </Paper>
  );
}

export default Widget;
