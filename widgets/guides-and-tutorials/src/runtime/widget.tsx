import { type AllWidgetProps } from "jimu-core";
import { useEffect, useState } from "react";
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
  featureIconWrapStyle,
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
  mockBrowserImageStyle,
  videoCardStyle,
  videoElementStyle,
  imageOverlayStyle,
  imageOverlayImageStyle,
  imageOverlayCaptionStyle,
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
    title: "Region → Province Sidebar Browser",
    description:
      "Pick your Region, then Province, from the sidebar -- it jumps you straight to that area's Proposed LC Maps page with the LC Map Number picker already open.",
  },
  {
    icon: "\u{1F4E4}",
    title: "Add Your Own Shapefile",
    description:
      "Add your own zipped shapefile to the map to compare it against the Proposed LC Map -- it's visible only to you and never uploaded anywhere.",
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
      "The View Feedbacks page summarizes every comment submitted, searchable and filterable by Region, Province, LC Map Number, and Office.",
  },
  {
    icon: "\u{1F5FA}\u{FE0F}",
    title: "Jump From a Comment to Its Map",
    description:
      "From View Feedbacks, click “View on Map” on any comment to go straight to its Proposed LC Map, already filtered and zoomed in on that comment.",
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
  // Real screenshot to show instead of the icon/caption placeholder, once
  // one exists for this step. Click to zoom.
  image?: string;
  // Short screen recording to show instead -- takes priority over `image`
  // when both are set. Hosted in R2 (same as GAD/LCD/About media) rather
  // than bundled, since this project's build doesn't have a loader for
  // video files. Static preview as a card; real playback controls once
  // zoomed (see MockBrowser/StepWalkthrough below).
  video?: string;
};

const steps: Step[] = [
  {
    icon: "\u{1F4CD}",
    caption: "Sidebar → Region ▾ → Province → LC Map Number ▾",
    title: "Pick a Region, Province, and LC Map Number",
    description:
      "Open the “Region” section at the bottom of the sidebar, click your Region to reveal its provinces, then click your Province -- this takes you straight to the Proposed LC Maps page with a “Choose a Layer” popup already showing your Region and Province. Pick the LC Map Number from the dropdown to load that map onto the view and zoom to its extent automatically.",
    video: "https://files.angelobracero.com/uploads/videos/48c0e32e-2fae-4f5b-9b67-7712b5a51c7c.mp4",
  },
  {
    icon: "\u{1F4E4}",
    caption: "Add Own Layer",
    title: "Add Your Own Shapefile (Optional)",
    description:
      "Click “Add Own Layer” and choose a zipped shapefile from your computer to add it to the map for comparison -- this happens entirely in your browser, so it's visible only to you and is never uploaded or saved anywhere.",
    video: "https://files.angelobracero.com/uploads/videos/edb24dd8-70be-4b76-8479-5cde4630ad9d.mp4",
  },
  {
    icon: "\u{1F5C2}\u{FE0F}",
    caption: "Layers on Map list",
    title: "Manage Layers in the List",
    description:
      "The Layers on Map list shows the official LC map plus any shapefiles you've added. Click a layer's name to zoom to it, or click Remove to take one of your own layers off the map -- the official LC map can't be removed from there, only your own uploads.",
    video: "https://files.angelobracero.com/uploads/videos/4ab6a253-9313-4029-951f-fd63760b4225.mp4",
  },
  {
    icon: "\u{1F4AC}",
    caption: "Comment pins on the map",
    title: "Review the Map and Existing Comments",
    description:
      "Comments already submitted by other reviewers appear as points on the map, alongside the LC map boundaries.",
    video: "https://files.angelobracero.com/uploads/videos/d0f3104f-8c63-4e63-8e18-217dfa15165f.mp4",
  },
  {
    icon: "\u{270F}\u{FE0F}",
    caption: "Office · Email · Comment",
    title: "Add Your Comment",
    description:
      "Click on the area you want to comment on, then fill in your Office, Email, and Comment. Your name and the region/province/LC map number are filled in for you automatically, based on your account and the map you selected. If you're drawing a shape (like a polygon or line) instead of a single point, double-click to finish it. Once submitted, your comment is saved and will appear in the View Feedbacks page, grouped and searchable by province.",
    video: "https://files.angelobracero.com/uploads/videos/f56ca6ce-b14a-444d-b877-828a9fa81d66.mp4",
  },
];

const viewFeedbackSteps: Step[] = [
  {
    icon: "\u{1F4CB}",
    caption: "View Feedbacks page",
    title: "Go to “View Feedbacks”",
    description:
      "Open the View Feedbacks page from the main menu to see every comment submitted on the Proposed LC Maps.",
    video: "https://files.angelobracero.com/uploads/videos/6c7db260-8f19-4d5b-aa30-11227f0d29ec.mp4",
  },
  {
    icon: "\u{1F50D}",
    caption: "Search · More Filters · Sort · Date Range",
    title: "Narrow It Down",
    description:
      "Type into Search to match comment text, editor, or office -- matches are highlighted right in the results. Click “More Filters” to reveal Region, Province, LC Map Number, and Office chips (picking a Region reveals its provinces, and picking a Province reveals its LC Map Numbers); you can select more than one of each, and combine them with Sort by date and Date range. “Clear filters” resets everything.",
    video: "https://files.angelobracero.com/uploads/videos/0ca7527a-65ba-45a5-b97a-4355d396ba67.mp4",
  },
  {
    icon: "\u{1F4AC}",
    caption: "Editor · Office · LC Map · Date · Attachments",
    title: "Read a Comment",
    description:
      "Each comment shows who submitted it, their office, which LC map it's about, and when, along with the full comment text. Click a comment to open it enlarged for easier reading. If it has supporting photos or files attached, they appear as clickable chips below it -- a photo opens a full-size preview right on the page, and a non-photo file opens in a new tab.",
    video: "https://files.angelobracero.com/uploads/videos/6c81bd2c-fb9e-44b6-bf47-93abeb7e3169.mp4",
  },
  {
    icon: "\u{1F5FA}\u{FE0F}",
    caption: "View on Map",
    title: "Jump to a Comment on the Map",
    description:
      "Inside the enlarged comment view, click “View on Map” to go straight to that comment's Proposed LC Map -- it automatically selects the right Region, Province, and LC Map Number, then zooms in on that exact comment.",
    video: "https://files.angelobracero.com/uploads/videos/94d36522-3fef-42c0-975d-5903c463e191.mp4",
  },
];

function MockBrowser(props: {
  icon: string;
  caption: string;
  image?: string;
  video?: string;
  onZoom?: () => void;
}) {
  // A video's proportions vary too much to force into the fixed 16:10
  // "browser window" box below (that's what was cropping it) -- shown at
  // its own natural size instead, with no browser-chrome frame.
  if (props.video) {
    return (
      <div css={videoCardStyle} onClick={props.onZoom}>
        {/* Static preview, not autoplaying -- clicking opens the full-size
            zoomed view below, which has real playback controls. Autoplaying
            every step's video the moment the page loads (there can be ~9 of
            them) wasted real bandwidth for something nobody was watching yet. */}
        <video
          css={videoElementStyle}
          src={props.video}
          muted
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

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
      {props.image ? (
        <div css={mockBrowserContentStyle} style={{ padding: 0 }}>
          <img
            css={mockBrowserImageStyle}
            src={props.image}
            alt={props.caption}
            onClick={props.onZoom}
          />
        </div>
      ) : (
        <div css={mockBrowserContentStyle}>
          <span css={mockBrowserIconStyle}>{props.icon}</span>
          <span css={mockBrowserCaptionStyle}>{props.caption}</span>
        </div>
      )}
    </div>
  );
}

function StepWalkthrough(props: { steps: Step[] }) {
  const [zoomedStep, setZoomedStep] = useState<Step | null>(null);

  useEffect(() => {
    if (!zoomedStep) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomedStep(null);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomedStep]);

  return (
    <div css={stepListStyle}>
      {props.steps.map((step, index) => {
        const media = (
          <MockBrowser
            icon={step.icon}
            caption={step.caption}
            image={step.image}
            video={step.video}
            onZoom={() => setZoomedStep(step)}
          />
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

      {zoomedStep?.video ? (
        <div css={imageOverlayStyle} onClick={() => setZoomedStep(null)}>
          <video
            css={imageOverlayImageStyle}
            src={zoomedStep.video}
            controls
            playsInline
            onClick={(e) => e.stopPropagation()}
          />
          <p css={imageOverlayCaptionStyle}>{zoomedStep.title}</p>
        </div>
      ) : (
        zoomedStep?.image && (
          <div css={imageOverlayStyle} onClick={() => setZoomedStep(null)}>
            <img
              css={imageOverlayImageStyle}
              src={zoomedStep.image}
              alt={zoomedStep.caption}
              onClick={(e) => e.stopPropagation()}
            />
            <p css={imageOverlayCaptionStyle}>{zoomedStep.title}</p>
          </div>
        )
      )}
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
          <h3 css={sectionTitleStyle}>What You Can Do on This Site</h3>
          <p css={sectionIntroStyle}>
            The public, LGUs, and partner agencies can use this site to review
            Proposed Land Classification Maps from NAMRIA's Forestland
            Evaluation and Mapping Project and submit feedback before
            endorsement. Here's an overview of what's available:
          </p>

          <div css={featureGridStyle}>
            {features.map((feature) => (
              <div key={feature.title} css={featureCardStyle}>
                <span css={featureIconWrapStyle}>
                  <span css={featureIconStyle}>{feature.icon}</span>
                </span>
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
