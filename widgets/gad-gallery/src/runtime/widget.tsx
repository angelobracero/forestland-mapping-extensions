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
  overlayCloseButtonStyle,
} from "./style";

// TODO: replace these placeholder photos and captions with the actual
// LCD GAD activity photos once they are available.
const baseActivities = [
  {
    title: "Gender Sensitivity Training for LCD Personnel",
    date: "March 2025",
  },
  {
    title: "Women in Geospatial Mapping Workshop",
    date: "May 2025",
  },
  {
    title: "GAD Orientation for New Employees",
    date: "June 2025",
  },
  {
    title: "International Women's Month Celebration",
    date: "March 2025",
  },
  {
    title: "Community Outreach and Education Program",
    date: "August 2025",
  },
  {
    title: "LCD GAD Planning Workshop",
    date: "January 2025",
  },
];

// Duplicated a few times (with different placeholder photos) just so the
// gallery has enough content to scroll. Remove the duplicates once real
// photos are added.
const activities = Array.from({ length: 3 }, (_, batch) =>
  baseActivities.map((activity, i) => {
    const seed = batch * baseActivities.length + i;

    return {
      ...activity,
      image: `https://picsum.photos/seed/gad-${seed}/600/450`,
    };
  }),
).flat();

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

  const selectedActivity =
    selectedIndex !== null ? activities[selectedIndex] : null;

  return (
    <Paper className="jimu-widget" component="main">
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h2 css={titleStyle}>LCD GAD Activities</h2>
          <div css={dividerStyle} />
          <p css={subtitleStyle}>
            A look at the Gender and Development (GAD) initiatives of the
            Land Classification Division, including trainings, workshops,
            and outreach activities.
          </p>
        </div>

        <div css={gridStyle}>
          {activities.map((activity, index) => (
            <div
              key={`${activity.title}-${index}`}
              css={cardStyle}
              onClick={() => setSelectedIndex(index)}
            >
              <div css={imageWrapperStyle}>
                <img
                  css={imageStyle}
                  src={activity.image}
                  alt={activity.title}
                />
              </div>
              <div css={captionStyle}>
                <p css={captionTitleStyle}>{activity.title}</p>
                <div css={captionDateStyle}>{activity.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedActivity && (
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
            src={selectedActivity.image}
            alt={selectedActivity.title}
            onClick={(e) => e.stopPropagation()}
          />

          <div css={overlayCaptionStyle}>
            <p css={overlayCaptionTitleStyle}>{selectedActivity.title}</p>
            <div css={overlayCaptionDateStyle}>{selectedActivity.date}</div>
          </div>
        </div>
      )}
    </Paper>
  );
}

export default Widget;
