import { type AllWidgetProps } from "jimu-core";
import { useState } from "react";
import { Paper, Select, Option } from "jimu-ui";

import {
  sidebarStyle,
  navStyle,
  navListStyle,
  navItemStyle,
  lcMapStyle,
} from "./style";

const lcMaps = [
  {
    region: "CAR",
    province: "Benguet",
    id: "benguet-123",
    name: "Benguet LC Map",
  },
  {
    region: "CAR",
    province: "Ifugao",
    id: "ifugao-456",
    name: "Ifugao LC Map",
  },
  {
    region: "Region IV-A",
    province: "Quezon",
    id: "quezon-789",
    name: "Quezon LC Map",
  },
];

const regions = [...new Set(lcMaps.map((map) => map.region))];

function Widget(props: AllWidgetProps<any>) {
  const [showLcMaps, setShowLcMaps] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedLcMap, setSelectedLcMap] = useState<string | null>(null);

  return (
    <Paper css={sidebarStyle} className="jimu-widget" component="header">
      {/* <div css={imageContainerStyle}>
        <img src={namriaLogo} alt="NAMRIA" css={imageStyle} />
      </div> */}

      <nav css={navStyle}>
        <ul css={navListStyle}>
          <li css={navItemStyle}>Home</li>

          <li css={navItemStyle}>About</li>

          <li css={navItemStyle}>Gender and Development</li>

          <li css={navItemStyle}>LCD in Action</li>

          <li css={navItemStyle}>Guides and Tutorials</li>

          <li css={navItemStyle}>
            <div
              onClick={() => {
                setShowLcMaps(true);
                setSelectedRegion(null);
                setSelectedProvince(null);
                setSelectedLcMap(null);
              }}
            >
              Proposed LC Maps
            </div>

            {showLcMaps && (
              <div css={lcMapStyle}>
                <h3>Regions</h3>

                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      setSelectedProvince(null);
                      setSelectedLcMap(null);
                    }}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </li>

          <li css={navItemStyle}>View Feedbacks</li>
        </ul>
      </nav>

      {/* Region box */}

      {/* Province box */}
      {selectedRegion && (
        <div>
          <h3>Provinces</h3>

          {lcMaps
            .filter((map) => map.region === selectedRegion)
            .map((map) => (
              <button
                key={map.province}
                onClick={() => {
                  setSelectedProvince(map.province);
                  setSelectedLcMap(null);
                }}
              >
                {map.province}
              </button>
            ))}
        </div>
      )}

      {/* LC Map box */}
      {selectedProvince && (
        <div>
          <h3>LC Maps</h3>

          {lcMaps
            .filter(
              (map) =>
                map.region === selectedRegion &&
                map.province === selectedProvince,
            )
            .map((map) => (
              <button
                key={map.id}
                onClick={() => {
                  setSelectedLcMap(map.id);
                }}
              >
                {map.name}
              </button>
            ))}
        </div>
      )}
    </Paper>
  );
}

export default Widget;
