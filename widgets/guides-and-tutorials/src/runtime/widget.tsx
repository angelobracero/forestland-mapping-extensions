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
    title: "Region and Province Filters",
    description:
      "Narrow down LC maps and feedback by Region, then Province, so you only see what's relevant to your area.",
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
  // video files. Autoplays on loop, muted, no controls.
  video?: string;
};

const steps: Step[] = [
  {
    icon: "\u{1F5FA}\u{FE0F}",
    caption: "Proposed LC Maps page",
    title: "Go to “Proposed LC Maps”",
    description:
      "Open the Proposed LC Maps page from the main menu. This loads the interactive map along with the filter panel.",
    video: "https://files.angelobracero.com/uploads/videos/3b003799-6ea0-4edb-b678-7284dd9d0e00.mp4",
  },
  {
    icon: "\u{1F4CD}",
    caption: "Region ▾ → Province ▾ → LC Map Number ▾",
    title: "Select a Region, Province, and LC Map Number",
    description:
      "Use the three dropdowns to narrow down to the exact LC map you want to review: pick a Region first, then a Province, then the LC Map Number. Each choice updates the options below it, and picking the LC Map Number loads that map onto the view and zooms to its extent automatically.",
    video: "https://files.angelobracero.com/uploads/videos/f3b99adc-eb45-4f5e-92ca-14c8c78761da.mp4",
  },
  {
    icon: "\u{1F4E4}",
    caption: "Add Own Layer",
    title: "Add Your Own Shapefile (Optional)",
    description:
      "Click “Add Own Layer” and choose a zipped shapefile from your computer to add it to the map for comparison -- this happens entirely in your browser, so it's visible only to you and is never uploaded or saved anywhere.",
    video: "https://files.angelobracero.com/uploads/videos/a346033e-758d-44c0-ba18-de01be782732.mp4",
  },
  {
    icon: "\u{1F5C2}\u{FE0F}",
    caption: "Layers on Map list",
    title: "Manage Layers in the List",
    description:
      "The Layers on Map list shows the official LC map plus any shapefiles you've added. Click a layer's name to zoom to it, or click Remove to take one of your own layers off the map -- the official LC map can't be removed from there, only your own uploads.",
    video: "https://files.angelobracero.com/uploads/videos/19ab8fac-db5b-4f39-b824-562230ddfdea.mp4",
  },
  {
    icon: "\u{1F4AC}",
    caption: "Comment pins on the map",
    title: "Review the Map and Existing Comments",
    description:
      "Comments already submitted by other reviewers appear as points on the map, alongside the LC map boundaries.",
    video: "https://files.angelobracero.com/uploads/videos/95a605da-ffd4-4d67-8e10-9f8003493f68.mp4",
  },
  {
    icon: "\u{270F}\u{FE0F}",
    caption: "Office · Email · Comment",
    title: "Add Your Comment",
    description:
      "Click on the area you want to comment on, then fill in your Office, Email, and Comment. Your name and the region/province/LC map number are filled in for you automatically, based on your account and the map you selected. If you're drawing a shape (like a polygon or line) instead of a single point, double-click to finish it. Once submitted, your comment is saved and will appear in the View Feedbacks page, grouped and searchable by province.",
    video: "https://files.angelobracero.com/uploads/videos/e400ce04-4c9d-4a9f-a93a-d8369db3aaf7.mp4",
  },
];

const viewFeedbackSteps: Step[] = [
  {
    icon: "\u{1F4CB}",
    caption: "View Feedbacks page",
    title: "Go to “View Feedbacks”",
    description:
      "Open the View Feedbacks page from the main menu to see every comment submitted on the Proposed LC Maps.",
    video: "https://files.angelobracero.com/uploads/videos/eab6ff1a-2288-4bdb-bc3c-89c0da75d195.mp4",
  },
  {
    icon: "\u{1F50D}",
    caption: "Search + Region / Province / LC Map filters",
    title: "Narrow It Down",
    description:
      "Type into Search to match comment text, editor, or office, or click the Region, Province, and LC Map Number filter pills to zero in on exactly what you're looking for. You can select more than one of each.",
    video: "https://files.angelobracero.com/uploads/videos/43e55bd2-70f7-4568-a15e-75f32e312e31.mp4",
  },
  {
    icon: "\u{1F4AC}",
    caption: "Editor · Office · LC Map · Date",
    title: "Read a Comment",
    description:
      "Each comment shows who submitted it, their office, which LC map it's about, and when, along with the full comment text. Click a comment to open it enlarged for easier reading.",
    video: "https://files.angelobracero.com/uploads/videos/163c4d81-f215-4904-95a5-e7e86f6f64da.mp4",
  },
  {
    icon: "\u{1F5FA}\u{FE0F}",
    caption: "View on Map",
    title: "Jump to a Comment on the Map",
    description:
      "Inside the enlarged comment view, click “View on Map” to go straight to that comment's Proposed LC Map -- it automatically selects the right Region, Province, and LC Map Number, then zooms in on that exact comment.",
    video: "https://files.angelobracero.com/uploads/videos/c40a3990-b174-49c1-95af-e81f34bd3c20.mp4",
  },
  {
    icon: "\u{1F4CE}",
    caption: "Photos And Files",
    title: "Check Attachments",
    description:
      "If a comment has supporting photos or files attached, they appear as clickable links right below it.",
    video: "https://files.angelobracero.com/uploads/videos/82499f5c-f3a5-4305-9f2c-d1045bf539ce.mp4",
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
        <video
          css={videoElementStyle}
          src={props.video}
          autoPlay
          loop
          muted
          playsInline
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
            autoPlay
            loop
            muted
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
