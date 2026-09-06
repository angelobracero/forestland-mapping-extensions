import { type AllWidgetProps, UrlManager, getAppStore } from "jimu-core";
import { useEffect, useState } from "react";
import { Paper } from "jimu-ui";
import { checkIsContentAdmin } from "widgets/shared-code/admin-auth";

import {
  sidebarStyle,
  logoContainerStyle,
  logoButtonStyle,
  logoImageStyle,
  logoTitleStyle,
  navStyle,
  navItemStyle,
  navLinkStyle,
} from "./style";

const namriaLogo = require("./assets/namria-logo.png");

// Pages are looked up by their label (the page name shown in the builder)
// instead of a hardcoded page id, so renaming a page or regenerating its id
// in the builder doesn't break this nav. Keep these in sync with the page
// labels used in the app.
type NavLink = {
  label: string;
  adminOnly?: boolean;
};

const navLinks: NavLink[] = [
  { label: "Home" },
  { label: "About" },
  { label: "Gender and Development" },
  { label: "LCD in Action" },
  { label: "Guides and Tutorials" },
  { label: "Proposed LC Maps" },
  { label: "View Feedbacks" },
  { label: "Content Admin", adminOnly: true },
];

function Widget(props: AllWidgetProps<any>) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const currentUsername = getAppStore().getState().portalSelf?.user?.username;
      const result = await checkIsContentAdmin(currentUsername);

      if (!cancelled) {
        setIsAdmin(result);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleNavLinks = navLinks.filter((link) => !link.adminOnly || isAdmin);

  const goToPage = (pageLabel: string) => {
    const { pages } = getAppStore().getState().appConfig;
    const page = Object.values(pages).find((p) => p.label === pageLabel);

    if (!page) {
      console.warn(`forestland-menu: no page found named "${pageLabel}".`);

      return;
    }

    UrlManager.getInstance().changePage(page.id);
  };

  return (
    <Paper css={sidebarStyle} className="jimu-widget" component="nav">
      <div css={logoContainerStyle}>
        <button
          type="button"
          css={logoButtonStyle}
          onClick={() => goToPage("Home")}
        >
          <img css={logoImageStyle} src={namriaLogo} alt="NAMRIA logo" />
        </button>
        <span css={logoTitleStyle}>
          Forestland Evaluation &amp; Mapping Project
        </span>
      </div>

      <ul css={navStyle}>
        {visibleNavLinks.map(({ label }) => (
          <li key={label} css={navItemStyle}>
            <button
              type="button"
              css={navLinkStyle}
              onClick={() => goToPage(label)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </Paper>
  );
}

export default Widget;
