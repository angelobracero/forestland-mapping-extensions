import { type AllWidgetProps } from "jimu-core";
import { Paper } from "jimu-ui";

import {
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
  sectionStyle,
  sectionTitleStyle,
  sectionIntroStyle,
  featureGridStyle,
  featureCardStyle,
  featureIconStyle,
  featureTitleStyle,
  featureDescStyle,
  stepListStyle,
  stepRowStyle,
  mockBrowserStyle,
  mockBrowserChromeStyle,
  mockBrowserDotStyle,
  mockBrowserContentStyle,
  mockBrowserIconStyle,
  mockBrowserCaptionStyle,
  stepContentStyle,
  stepHeaderStyle,
  stepNumberBadgeStyle,
  stepTitleStyle,
  stepDescStyle,
  noteBoxStyle,
} from "./style";

const features = [
  {
    icon: "\u{1F5FA}\u{FE0F}",
    title: "Interactive Map Viewer",
    description:
      "Browse Proposed LC Maps directly on an interactive map, with each map zooming to its own extent once selected.",
  },
  {
    icon: "\u{1F50D}",
    title: "Region and Province Filters",
    description:
      "Narrow down LC maps and feedback by Region, then Province, so you only see what's relevant to your area.",
  },
  {
    icon: "\u{1F4AC}",
    title: "Submit Feedback",
    description:
      "Leave comments directly on a Proposed LC Map so the LCD team and reviewers can see them during evaluation.",
  },
  {
    icon: "\u{1F4CB}",
    title: "Track All Feedback",
    description:
      "The View Feedbacks page summarizes every comment submitted, grouped and searchable by province.",
  },
  {
    icon: "\u{1F4F8}",
    title: "GAD Activities Gallery",
    description:
      "See photos from the Land Classification Division's Gender and Development activities and events.",
  },
  {
    icon: "\u{2139}\u{FE0F}",
    title: "Project Background",
    description:
      "Learn about the Forestland Evaluation and Mapping Project and its legal mandate on the Home and About pages.",
  },
];

const steps = [
  {
    icon: "\u{1F5FA}\u{FE0F}",
    caption: "Proposed LC Maps page",
    title: "Go to “Proposed LC Maps”",
    description:
      "Open the Proposed LC Maps page from the main menu. This loads the interactive map along with the filter panel.",
  },
  {
    icon: "\u{1F4CD}",
    caption: "Region ▾",
    title: "Select a Region",
    description:
      "Use the Region dropdown to choose your region. This narrows down the list of provinces to only the ones in that region.",
  },
  {
    icon: "\u{1F3DE}\u{FE0F}",
    caption: "Province ▾",
    title: "Select a Province",
    description:
      "Pick your province from the updated list. The available LC Map Numbers will update automatically based on your choice.",
  },
  {
    icon: "\u{1F522}",
    caption: "LC Map Number ▾ → map loads",
    title: "Select an LC Map Number",
    description:
      "Choose the specific LC map you want to review. It loads onto the map and the view zooms to that map's extent automatically.",
  },
  {
    icon: "\u{1F4AC}",
    caption: "Comment pins on the map",
    title: "Review the Map and Existing Comments",
    description:
      "Comments already submitted by other reviewers appear as points on the map, alongside the LC map boundaries.",
  },
  {
    icon: "\u{270F}\u{FE0F}",
    caption: "Office · Comment · Attach Photos",
    title: "Add Your Comment",
    description:
      "Click on the area you want to comment on, then fill in your Office and Comment. You can optionally attach supporting photos or files.",
  },
  {
    icon: "\u{2705}",
    caption: "View Feedbacks → grouped by Province",
    title: "Submit and Track It",
    description:
      "Once submitted, your comment is saved and will appear in the View Feedbacks page, grouped and searchable by province.",
  },
];

function MockBrowser(props: { icon: string; caption: string }) {
  return (
    <div css={mockBrowserStyle}>
      <div css={mockBrowserChromeStyle}>
        <span
          css={mockBrowserDotStyle}
          style={{ backgroundColor: "#ff5f57" }}
        />
        <span
          css={mockBrowserDotStyle}
          style={{ backgroundColor: "#febc2e" }}
        />
        <span
          css={mockBrowserDotStyle}
          style={{ backgroundColor: "#28c840" }}
        />
      </div>
      <div css={mockBrowserContentStyle}>
        <span css={mockBrowserIconStyle}>{props.icon}</span>
        <span css={mockBrowserCaptionStyle}>{props.caption}</span>
      </div>
    </div>
  );
}

function Widget(props: AllWidgetProps<any>) {
  return (
    <Paper className="jimu-widget" component="main">
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h2 css={titleStyle}>Guides and Tutorials</h2>
          <div css={dividerStyle} />
          <p css={subtitleStyle}>
            New to the site? Here's a quick introduction to what you can do, and
            a step-by-step guide to reviewing and commenting on a Proposed LC
            Map.
          </p>
        </div>

        <section css={sectionStyle}>
          <h3 css={sectionTitleStyle}>Introduction to the Web App</h3>
          <p css={sectionIntroStyle}>
            This site lets the public, LGUs, and partner agencies view Proposed
            Land Classification Maps from NAMRIA's Forestland Evaluation and
            Mapping Project, and submit feedback on them before endorsement.
            Here's what you'll find around the site:
          </p>

          <div css={featureGridStyle}>
            {features.map((feature) => (
              <div key={feature.title} css={featureCardStyle}>
                <span css={featureIconStyle}>{feature.icon}</span>
                <p css={featureTitleStyle}>{feature.title}</p>
                <p css={featureDescStyle}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section css={sectionStyle}>
          <h3 css={sectionTitleStyle}>
            How to View and Comment on a Proposed LC Map
          </h3>
          <p css={sectionIntroStyle}>
            Follow these steps to find a specific LC map for your area and let
            the Land Classification Division know what you think.
          </p>

          <div css={stepListStyle}>
            {steps.map((step, index) => {
              const media = (
                <MockBrowser icon={step.icon} caption={step.caption} />
              );

              const content = (
                <div css={stepContentStyle}>
                  <div css={stepHeaderStyle}>
                    <span css={stepNumberBadgeStyle}>{index + 1}</span>
                    <p css={stepTitleStyle}>{step.title}</p>
                  </div>
                  <p css={stepDescStyle}>{step.description}</p>
                </div>
              );

              // Alternate which side the instruction text and the image
              return (
                <div key={step.title} css={stepRowStyle}>
                  {index % 2 === 0 ? (
                    <>
                      {content}
                      {media}
                    </>
                  ) : (
                    <>
                      {media}
                      {content}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div css={noteBoxStyle}>
            <span>{"\u{1F4A1}"}</span>
            <span>
              Tip: You can always check the status of your comment, and read
              what others have submitted, from the View Feedbacks page.
            </span>
          </div>
        </section>
      </div>
    </Paper>
  );
}

export default Widget;
