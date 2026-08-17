import { type AllWidgetProps } from "jimu-core";
import { Paper, WidgetPlaceholder, Nav, NavLink } from "jimu-ui";
const person = require("./assets/person.svg");

import { sidebarStyle, navStyle, navLinkStyle } from "./style";

function Widget(props: AllWidgetProps<any>) {
  return (
    <Paper css={sidebarStyle} className="jimu-widget" component="header">
      {/* <div css={imageContainerStyle}>
        <img src={namriaLogo} alt="NAMRIA" css={imageStyle} />
      </div> */}
      <div>
        <WidgetPlaceholder icon={person} />
      </div>
      <Nav css={navStyle}>
        <NavLink css={navLinkStyle}>Home</NavLink>
        <NavLink css={navLinkStyle}>About</NavLink>
        <NavLink css={navLinkStyle}>Gender and Development</NavLink>
        <NavLink css={navLinkStyle}>LCD in Action</NavLink>
        <NavLink css={navLinkStyle}>Guides and Tutorials</NavLink>
        <NavLink css={navLinkStyle}>Proposed LC Maps</NavLink>
        <NavLink css={navLinkStyle}>View Feedbacks</NavLink>
      </Nav>
      {/* <Nav css={navStyle}>
          <ul css={navListStyle}>
            <li css={navItemStyle}>Home</li>

            <li css={navItemStyle}>About</li>

            <li css={navItemStyle}>Gender and Development</li>

            <li css={navItemStyle}>LCD in Action</li>

            <li css={navItemStyle}>Guides and Tutorials</li>

            <li css={navItemStyle}>Proposed LC Maps</li>

            <li css={navItemStyle}>View Feedbacks</li>
          </ul>
        </Nav> */}
    </Paper>
  );
}

export default Widget;
