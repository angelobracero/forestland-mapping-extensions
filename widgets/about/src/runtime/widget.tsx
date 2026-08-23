import { type AllWidgetProps } from "jimu-core";
import { Paper } from "jimu-ui";

import {
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
  videoGridStyle,
  videoCardStyle,
  videoThumbStyle,
  playButtonStyle,
  videoPlaceholderLabelStyle,
  videoInfoStyle,
  videoTitleStyle,
  videoDescStyle,
} from "./style";

// TODO: replace these placeholder thumbnails with the real AVPs once
// they're ready — either embed them with the built-in Embed widget, or
// swap the placeholder <div> below for a real <iframe>/<video> element.
const avps = [
  {
    title: "AVP for LC Survey",
    description:
      "A short audio-visual presentation on how NAMRIA conducts Land Classification (LC) surveys in the field, from technical mapping to boundary validation.",
  },
  {
    title: "AVP for FEM Project",
    description:
      "An overview of the Forestland Evaluation and Mapping (FEM) Project — its mandate, process, and impact on land governance nationwide.",
  },
];

function Widget(props: AllWidgetProps<any>) {
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

        <div css={videoGridStyle}>
          {avps.map((avp) => (
            <div key={avp.title} css={videoCardStyle}>
              <div css={videoThumbStyle}>
                <span css={playButtonStyle}>&#9658;</span>
                <span css={videoPlaceholderLabelStyle}>
                  Placeholder video
                </span>
              </div>
              <div css={videoInfoStyle}>
                <p css={videoTitleStyle}>{avp.title}</p>
                <p css={videoDescStyle}>{avp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Paper>
  );
}

export default Widget;
