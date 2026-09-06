import { type AllWidgetProps } from "jimu-core";
import { Paper } from "jimu-ui";

import {
  heroStyle,
  heroOverlayStyle,
  heroContentStyle,
  heroTitleStyle,
  heroTitleUnderlineStyle,
  containerStyle,
  contentCardStyle,
  titleStyle,
  titleUnderlineStyle,
  leadParagraphStyle,
  paragraphStyle,
  sectionStyle,
  missionCardStyle,
  missionTitleStyle,
  missionParagraphStyle,
} from "./style";

const homeBg = require("./assets/home-bg-hero.jpg");

const heroTitleText = (
  <>
    Forestland Evaluation &amp; Mapping Project: Land Classification Survey of
    Unclassified Public Forests
  </>
);

function Widget(props: AllWidgetProps<any>) {
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
        <div css={contentCardStyle}>
          <h2 css={titleStyle}>
            Mapping the Future of the Philippines' Public Lands
          </h2>
          <div css={titleUnderlineStyle} />

          <p css={leadParagraphStyle}>
            The <b>Forestland Evaluation and Mapping (FEM) Project</b> is
            NAMRIA's continuing initiative to classify the country's remaining{" "}
            <b>Unclassified Public Forests (UPFs)</b> and provide reliable,
            up-to-date <b>Land Classification (LC)</b> information. Through
            accurate mapping, technical surveys, and geospatial data management,
            the project supports sustainable land governance and informed
            decision-making nationwide.
          </p>

          <div css={sectionStyle}>
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
          </div>

          <div css={sectionStyle}>
            <p css={paragraphStyle}>
              Led by the <b>Land Classification Division (LCD)</b> of the{" "}
              <b>Resource Data Analysis Branch (RDAB)</b>, the project continues
              the systematic evaluation of the country's remaining UPFs—public
              lands that have not yet undergone official land classification.
              These activities are carried out in accordance with{" "}
              <b>Section 3, Article XII of the 1987 Philippine Constitution</b>,
              which governs the classification of lands of the public domain.
            </p>
          </div>

          <div css={sectionStyle}>
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
              for the issuance of the corresponding{" "}
              <b>DENR Administrative Order</b>.
            </p>
          </div>

          <div css={sectionStyle}>
            <p css={paragraphStyle}>
              Beyond mapping, the project serves as a trusted source of land
              classification information by providing maps, datasets, and
              technical assistance to the <b>DENR</b>, its Regional Offices,{" "}
              <b>Local Government Units (LGUs)</b>, other government agencies,
              non-government organizations (NGOs), academic institutions, private
              stakeholders, and the general public.
            </p>
          </div>
        </div>

        <div css={missionCardStyle}>
          <h2 css={missionTitleStyle}>
            Building a Reliable Foundation for Sustainable Land Management
          </h2>
          <p css={missionParagraphStyle}>
            By combining geospatial technologies, technical expertise, and
            national standards, the Forestland Evaluation and Mapping Project
            strengthens land administration, supports environmental protection,
            promotes responsible land use planning, and contributes to the
            sustainable development of the Philippines.
          </p>
        </div>
      </div>
    </Paper>
  );
}

export default Widget;
