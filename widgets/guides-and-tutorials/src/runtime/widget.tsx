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

type Step = {
  icon: string;
  caption: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: "\u{1F5FA}\u{FE0F}",
    caption: "Proposed LC Maps page",
    title: "Go to “Proposed LC Maps”",
    description:
      "Open the Proposed LC Maps page from the main menu. This loads the interactive map along with the filter panel.",
  },
  {
    icon: "\u{1F4CD}",
    caption: "Region ▾ → Province ▾ → LC Map Number ▾",
    title: "Select a Region, Province, and LC Map Number",
    description:
      "Use the three dropdowns to narrow down to the exact LC map you want to review: pick a Region first, then a Province, then the LC Map Number. Each choice updates the options below it, and picking the LC Map Number loads that map onto the view and zooms to its extent automatically.",
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
    caption: "Office · Email · Comment",
    title: "Add Your Comment",
    description:
      "Click on the area you want to comment on, then fill in your Office, Email, and Comment. Your name and the region/province/LC map number are filled in for you automatically, based on your account and the map you selected.",
  },
  {
    icon: "\u{2705}",
    caption: "View Feedbacks → grouped by Province",
    title: "Submit and Track It",
    description:
      "Once submitted, your comment is saved and will appear in the View Feedbacks page, grouped and searchable by province.",
  },
];

const viewFeedbackSteps: Step[] = [
  {
    icon: "\u{1F4CB}",
    caption: "View Feedbacks page",
    title: "Go to “View Feedbacks”",
    description:
      "Open the View Feedbacks page from the main menu to see every comment submitted on the Proposed LC Maps, grouped by province.",
  },
  {
    icon: "\u{1F50D}",
    caption: "Search + Region / Province / LC Map filters",
    title: "Narrow It Down",
    description:
      "Type into Search to match comment text, editor, or office, or click the Region, Province, and LC Map Number filter pills to zero in on exactly what you're looking for. You can select more than one of each.",
  },
  {
    icon: "\u{1F4C2}",
    caption: "Province card expands",
    title: "Open a Province",
    description:
      "Click any province card to expand it and reveal every comment submitted for that province.",
  },
  {
    icon: "\u{1F4AC}",
    caption: "Editor · Office · LC Map · Date",
    title: "Read a Comment",
    description:
      "Each comment shows who submitted it, their office, which LC map it's about, and when, along with the full comment text.",
  },
  {
    icon: "\u{1F4CE}",
    caption: "Photos And Files",
    title: "Check Attachments",
    description:
      "If a comment has supporting photos or files attached, they appear as clickable links right below it.",
  },
  {
    icon: "\u{2195}\u{FE0F}",
    caption: "Sort by date: Newest ▾",
    title: "Sort by Date",
    description:
      "Use the Sort by date control to see the newest submissions first, or flip it to see the oldest ones.",
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

function StepWalkthrough(props: { steps: Step[] }) {
  return (
    <div css={stepListStyle}>
      {props.steps.map((step, index) => {
        const media = <MockBrowser icon={step.icon} caption={step.caption} />;

        const content = (
          <div css={stepContentStyle}>
            <div css={stepHeaderStyle}>
              <span css={stepNumberBadgeStyle}>{index + 1}</span>
              <p css={stepTitleStyle}>{step.title}</p>
            </div>
            <p css={stepDescStyle}>{step.description}</p>
          </div>
        );

        // Alternate which side the instruction text and the image sit on.
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
            New to the site? Here's a quick introduction to what you can do,
            plus step-by-step guides to commenting on a Proposed LC Map and
            browsing everyone else's feedback.
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

          <StepWalkthrough steps={steps} />

          <div css={noteBoxStyle}>
            <span>{"\u{1F4A1}"}</span>
            <span>
              Tip: You can always check the status of your comment, and read
              what others have submitted, from the View Feedbacks page.
            </span>
          </div>
        </section>

        <section css={sectionStyle}>
          <h3 css={sectionTitleStyle}>
            How to View Comments on Proposed LC Maps
          </h3>
          <p css={sectionIntroStyle}>
            Already submitted feedback, or just want to see what others have
            said? Here's how to browse and filter every comment on the View
            Feedbacks page.
          </p>

          <StepWalkthrough steps={viewFeedbackSteps} />

          <div css={noteBoxStyle}>
            <span>{"\u{1F4A1}"}</span>
            <span>
              Tip: Filters combine, so you can pick a region, then a
              province, then narrow to one specific LC map number, all at
              once.
            </span>
          </div>
        </section>
      </div>
    </Paper>
  );
}

export default Widget;
