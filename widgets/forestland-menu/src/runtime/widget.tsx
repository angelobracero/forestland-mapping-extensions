import { type AllWidgetProps } from "jimu-core";
import { Paper } from "jimu-ui";

import { sidebarStyle, navStyle, navListStyle, navItemStyle } from "./style";

function Widget(props: AllWidgetProps<any>) {
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

          <li css={navItemStyle}>Proposed LC Maps</li>

          <li css={navItemStyle}>View Feedbacks</li>
        </ul>
      </nav>
    </Paper>
  );
}

export default Widget;
