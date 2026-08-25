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
  videoStyle,
  videoInfoStyle,
  videoTitleStyle,
  videoDescStyle,
} from "./style";

const mediaDatabaseLink = "https://files.angelobracero.com/about-page";

function Widget(props: AllWidgetProps<any>) {
  const avps = [
    {
      title: "Methodology on Land Classification of the Unclassified Land",
      description:
        "A short audio-visual presentation on how NAMRIA conducts Land Classification (LC) surveys in the field, from technical mapping to boundary validation.",
      video: `${mediaDatabaseLink}/LCD_AVP.mp4`,
    },
    {
      title: "Land CLassification Survey of the unclassified Public Forests",
      description:
        "An overview of the Forestland Evaluation and Mapping (FEM) Project — its mandate, process, and impact on land governance nationwide.",
      video: `${mediaDatabaseLink}/LCD_NAMRIA.mp4`,
    },
  ];

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
      </div>
    </Paper>
  );
}

export default Widget;
