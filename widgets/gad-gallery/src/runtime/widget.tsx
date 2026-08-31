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

const mediaDatabaseLink = "https://files.angelobracero.com/gad-page";

type Activity = {
  title?: string;
  date: string;
  image: string;
};

function Widget(props: AllWidgetProps<any>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const baseActivities: Activity[] = [
    {
      title: "Gender Sensitivity Training for LCD Personnel",
      date: "August 24, 2026",
      image: `${mediaDatabaseLink}/1.jpg`,
    },
    {
      title: "Women in Geospatial Mapping Workshop",
      date: "August 24, 2026",
      image: `${mediaDatabaseLink}/2.jpg`,
    },
    {
      title: "GAD Orientation for New Employees",
      date: "August 24, 2026",
      image: `${mediaDatabaseLink}/3.png`,
    },
    {
      title: "International Women's Month Celebration",
      date: "June 17, 2026",
      image: `${mediaDatabaseLink}/4.jpg`,
    },
    {
      title: "Community Outreach and Education Program",
      date: "August 11, 2026",
      image: `${mediaDatabaseLink}/5.jpg`,
    },
    {
      title: "LCD GAD Planning Workshop",
      date: "August 12, 2026",
      image: `${mediaDatabaseLink}/6.jpg`,
    },
    {
      title: "LCD GAD Planning Workshop",
      date: "August 12, 2026",
      image: `${mediaDatabaseLink}/7.jpg`,
    },
    {
      title: "LCD GAD Planning Workshop",
      date: "August 12, 2026",
      image: `${mediaDatabaseLink}/8.jpg`,
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

  const selectedActivity =
    selectedIndex !== null ? baseActivities[selectedIndex] : null;

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

        <div css={gridStyle}>
          {baseActivities.map((activity, index) => (
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
