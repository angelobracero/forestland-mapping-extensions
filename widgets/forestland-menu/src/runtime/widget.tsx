import { type AllWidgetProps, UrlManager, getAppStore } from "jimu-core";
import { Paper } from "jimu-ui";

import { headerStyle, navStyle, navItemStyle, navLinkStyle } from "./style";

// Pages are looked up by their label (the page name shown in the builder)
// instead of a hardcoded page id, so renaming a page or regenerating its id
// in the builder doesn't break this nav. Keep these in sync with the page
// labels used in the app.
const navLinks = [
  "Home",
  "About",
  "Gender and Development",
  "LCD in Action",
  "Guides and Tutorials",
  "Proposed LC Maps",
  "View Feedbacks",
];

function Widget(props: AllWidgetProps<any>) {
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
    <Paper css={headerStyle} className="jimu-widget" component="header">
      <ul css={navStyle}>
        {navLinks.map((label) => (
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
