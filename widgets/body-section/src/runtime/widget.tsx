import { type AllWidgetProps, UrlManager, getAppStore } from "jimu-core";
import { Paper } from "jimu-ui";

import {
  heroStyle,
  heroOverlayStyle,
  heroContentStyle,
  heroTitleStyle,
  heroTitleUnderlineStyle,
  containerStyle,
  statsRowStyle,
  statCardStyle,
  statNumberStyle,
  statLabelStyle,
  contentCardStyle,
  titleStyle,
  paragraphStyle,
  quickLinksHeaderStyle,
  quickLinksTitleStyle,
  quickLinksSubtitleStyle,
  quickLinksGridStyle,
  quickLinkCardStyle,
  quickLinkIconStyle,
  quickLinkLabelStyle,
  quickLinkArrowStyle,
} from "./style";

// A resized/compressed copy of home-bg.png, used so the hero image
// doesn't balloon the widget bundle (the original is ~5.8MB; this is
// ~460KB at a size that still looks sharp as a hero background).
const homeBg = require("./assets/home-bg-hero.jpg");

const heroTitleText = (
  <>
    Forestland Evaluation &amp; Mapping Project: Land Classification
    Survey of Unclassified Public Forests
  </>
);

const stats = [
  { number: "798,000 ha", label: "Unclassified Public Forests remaining to be classified" },
  { number: "DAO No. 31, s. 1988", label: "Legal basis for land classification, implementing E.O. 192" },
  { number: "LCD - RDAB", label: "Land Classification Division, Resource Data Analysis Branch" },
];

// Pages are looked up by label, same as in forestland-menu, so these
// links keep working even if a page's id changes in the builder.
const quickLinks = [
  { icon: "\u{1F3DE}\u{FE0F}", label: "Gender and Development" },
  { icon: "\u{1F4F8}", label: "LCD in Action" },
  { icon: "\u{1F5FA}\u{FE0F}", label: "Proposed LC Maps" },
  { icon: "\u{1F4AC}", label: "View Feedbacks" },
  { icon: "\u{1F4D8}", label: "Guides and Tutorials" },
  { icon: "\u{2139}\u{FE0F}", label: "About" },
];

function Widget(props: AllWidgetProps<any>) {
  const goToPage = (pageLabel: string) => {
    const { pages } = getAppStore().getState().appConfig;
    const page = Object.values(pages).find((p) => p.label === pageLabel);

    if (!page) {
      console.warn(`body-section: no page found named "${pageLabel}".`);

      return;
    }

    UrlManager.getInstance().changePage(page.id);
  };

  return (
    <Paper className="jimu-widget" component="main">
      <div css={heroStyle} style={{ backgroundImage: `url(${homeBg})` }}>
        <div css={heroOverlayStyle} />
        <div css={heroContentStyle}>
          <h1 css={heroTitleStyle}>{heroTitleText}</h1>
          <div css={heroTitleUnderlineStyle} />
        </div>
      </div>

      <div css={containerStyle}>
        <div css={statsRowStyle}>
          {stats.map((stat) => (
            <div key={stat.label} css={statCardStyle}>
              <div css={statNumberStyle}>{stat.number}</div>
              <div css={statLabelStyle}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div css={contentCardStyle}>
          <h2 css={titleStyle}>
            Mapping the Future of the Philippines' Public Lands
          </h2>
          <p css={paragraphStyle}>
            The <b>Forestland Evaluation and Mapping (FEM) Project</b> is
            NAMRIA's continuing initiative to classify the country's remaining
            <b>Unclassified Public Forests (UPFs)</b> and provide reliable,
            up-to-date <b>Land Classification (LC)</b> information. Through
            accurate mapping, technical surveys, and geospatial data management,
            the project supports sustainable land governance and informed
            decision-making nationwide.
          </p>
          <p css={paragraphStyle}>
            Guided by{" "}
            <b>Department Administrative Order (DAO) No. 31, series of 1988</b>,
            implementing <b>Executive Order No. 192 (1987)</b>, NAMRIA is
            mandated to classify, reclassify, assess, and establish the
            boundaries of lands within the public domain. This includes
            determining whether areas are suitable for agricultural, forest,
            mineral, commercial, residential, industrial, grazing, or other
            legally recognized land uses.
          </p>
          <p css={paragraphStyle}>
            Led by the <b>Land Classification Division (LCD)</b> of the
            <b>Resource Data Analysis Branch (RDAB)</b>, the project continues
            the systematic evaluation of the country's remaining UPFs—public
            lands that have not yet undergone official land classification.
            These activities are carried out in accordance with
            <b>Section 3, Article XII of the 1987 Philippine Constitution</b>,
            which governs the classification of lands of the public domain.
          </p>

          <p css={paragraphStyle}>
            Today, approximately <b>798,000 hectares</b> of UPFs remain to be
            classified across the Philippines. Each proposed Land Classification
            Map undergoes a rigorous technical review by the{" "}
            <b>National Sub-classification Secretariat (NSS)</b> and the{" "}
            <b>National Technical Evaluation Committee (NTEC)</b> before
            endorsement to the{" "}
            <b>
              Secretary of the Department of Environment and Natural Resources
              (DENR)
            </b>{" "}
            for the issuance of the corresponding
            <b>DENR Administrative Order</b>.
          </p>

          <p css={paragraphStyle}>
            Beyond mapping, the project serves as a trusted source of land
            classification information by providing maps, datasets, and
            technical assistance to the <b>DENR</b>, its Regional Offices,{" "}
            <b>Local Government Units (LGUs)</b>, other government agencies,
            non-government organizations (NGOs), academic institutions, private
            stakeholders, and the general public.
          </p>
        </div>

        <div css={contentCardStyle}>
          <h2 css={titleStyle}>
            Building a Reliable Foundation for Sustainable Land Management
          </h2>
          <p css={paragraphStyle}>
            By combining geospatial technologies, technical expertise, and
            national standards, the Forestland Evaluation and Mapping Project
            strengthens land administration, supports environmental protection,
            promotes responsible land use planning, and contributes to the
            sustainable development of the Philippines.
          </p>
        </div>

        <div>
          <div css={quickLinksHeaderStyle}>
            <h2 css={quickLinksTitleStyle}>Explore the Site</h2>
            <p css={quickLinksSubtitleStyle}>
              Jump straight to what you're looking for.
            </p>
          </div>

          <div css={quickLinksGridStyle}>
            {quickLinks.map((link) => (
              <div
                key={link.label}
                css={quickLinkCardStyle}
                onClick={() => goToPage(link.label)}
              >
                <span css={quickLinkIconStyle}>{link.icon}</span>
                <span css={quickLinkLabelStyle}>{link.label}</span>
                <span css={quickLinkArrowStyle}>&#8594;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Paper>
  );
}

export default Widget;
