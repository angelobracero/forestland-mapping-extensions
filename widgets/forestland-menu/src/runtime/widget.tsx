import {
  type AllWidgetProps,
  type IMState,
  UrlManager,
  getAppStore,
  ReactRedux,
} from "jimu-core";
import { useEffect, useState } from "react";
import { Paper } from "jimu-ui";
import type { SVGComponentProps } from "jimu-ui";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { checkIsContentAdmin } from "widgets/shared-code/admin-auth";
import { LC_MAP_CATALOG_ITEM_ID } from "widgets/shared-code/content-config";
import { PHILIPPINE_REGIONS } from "widgets/shared-code/philippine-regions";
import { PROVINCES_BY_REGION } from "widgets/shared-code/philippine-provinces";
import { setPendingRegionTarget } from "widgets/shared-code/region-navigation-store";
import { HomeOutlined } from "jimu-icons/outlined/application/home";
import { InfoOutlined } from "jimu-icons/outlined/suggested/info";
import { PersonOutlined } from "jimu-icons/outlined/application/person";
import { ImageOutlined } from "jimu-icons/outlined/data/image";
import { HelpOutlined } from "jimu-icons/outlined/suggested/help";
import { MessageOutlined } from "jimu-icons/outlined/data/message";
import { SettingOutlined } from "jimu-icons/outlined/application/setting";
import { PinOutlined } from "jimu-icons/outlined/application/pin";

import {
  sidebarStyle,
  logoContainerStyle,
  logoButtonStyle,
  logoImageStyle,
  logoTitleStyle,
  navStyle,
  navItemStyle,
  navLinkStyle,
  navLinkActiveStyle,
  navIconStyle,
  navToggleStyle,
  navToggleActiveStyle,
  navToggleLabelGroupStyle,
  regionListStyle,
  regionToggleStyle,
  provinceListStyle,
  provinceLinkStyle,
} from "./style";

const namriaLogo = require("./assets/namria-logo.png");

// Pages are looked up by their label (the page name shown in the builder)
// instead of a hardcoded page id, so renaming a page or regenerating its id
// in the builder doesn't break this nav. Keep these in sync with the page
// labels used in the app.
type NavLink = {
  label: string;
  icon: (props: SVGComponentProps) => JSX.Element;
  adminOnly?: boolean;
};

// Must match the page label used in view-feedbacks' own "View on Map" link
// to this same page -- pages are looked up by label, not a hardcoded id.
// This is only the internal page name for navigation; the sidebar displays
// this section as "Region" instead (see REGION_NAV_LABEL below).
const PROPOSED_LC_MAPS_PAGE_LABEL = "Proposed LC Maps";

const REGION_NAV_LABEL = "Region";

// Loaded once (see the "no maps published" effect below) to grey out
// provinces with no published LC Map yet, instead of letting a visitor
// navigate to an empty filter (see lcmap-filter's "no maps published"
// message, which this avoids ever surfacing from this sidebar).
const catalogLayer = new FeatureLayer({
  portalItem: { id: LC_MAP_CATALOG_ITEM_ID },
});

function regionProvinceKey(region: string, province: string): string {
  return `${region}|${province}`;
}

// The Region -> Province browser (rendered after these, at the very bottom
// of the sidebar) isn't a plain link, so it's kept out of this list.
const navLinks: NavLink[] = [
  { label: "Home", icon: HomeOutlined },
  { label: "About", icon: InfoOutlined },
  { label: "Gender and Development", icon: PersonOutlined },
  { label: "LCD in Action", icon: ImageOutlined },
  { label: "Guides and Tutorials", icon: HelpOutlined },
  { label: "View Feedbacks", icon: MessageOutlined },
  { label: "Content Admin", icon: SettingOutlined, adminOnly: true },
];

function Widget(props: AllWidgetProps<any>) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMapsExpanded, setIsMapsExpanded] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [provincesWithMaps, setProvincesWithMaps] = useState<Set<string>>(
    new Set(),
  );

  // Reactive (re-renders this widget on page navigation), unlike a plain
  // getAppStore().getState() read -- see jimu-core's own BaseWidget docs,
  // which recommend useSelector for function components needing state like
  // this. Compared against each nav link's label (not id) below, matching
  // how this widget already looks pages up everywhere else.
  const currentPageId = ReactRedux.useSelector(
    (state: IMState) => state.appRuntimeInfo.currentPageId,
  );
  const currentPageLabel =
    getAppStore().getState().appConfig.pages[currentPageId]?.label;

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

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      try {
        await catalogLayer.load();

        const query = catalogLayer.createQuery();

        // Excludes soft-removed entries, matching lcmap-filter's own catalog
        // query -- a removed LC Map shouldn't make its province look
        // available here either.
        query.where = "removed IS NULL OR removed <> 1";
        query.outFields = ["region", "province"];
        query.returnGeometry = false;

        const result = await catalogLayer.queryFeatures(query);

        if (cancelled) return;

        setProvincesWithMaps(
          new Set(
            result.features.map((feature) =>
              regionProvinceKey(
                feature.attributes.region,
                feature.attributes.province,
              ),
            ),
          ),
        );
      } catch (error) {
        console.error("forestland-menu: failed to load LC Map catalog:", error);
      }
    };

    loadCatalog();

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

  // Hands off the picked Region/Province (see widgets/shared-code/
  // region-navigation-store.ts), then navigates to the Proposed LC Maps
  // page, where lcmap-filter picks up the pending target: pre-selecting
  // that Region/Province and opening the filter popup so the visitor can
  // pick the LC Map Number themselves.
  const goToProposedMapsFor = (region: string, province: string) => {
    setPendingRegionTarget({ region, province });
    goToPage(PROPOSED_LC_MAPS_PAGE_LABEL);
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
        {visibleNavLinks.map(({ label, icon: Icon }) => (
          <li key={label} css={navItemStyle}>
            <button
              type="button"
              css={label === currentPageLabel ? navLinkActiveStyle : navLinkStyle}
              aria-current={label === currentPageLabel ? "page" : undefined}
              onClick={() => goToPage(label)}
            >
              <Icon css={navIconStyle} />
              {label}
            </button>
          </li>
        ))}

        {/* =====================================================
            REGION: Region -> Province browser, at the very bottom
            of the sidebar. Clicking a region reveals its provinces;
            clicking a province jumps straight to the Proposed LC
            Maps page with that Region/Province pre-selected (see
            goToProposedMapsFor above).
            ===================================================== */}

        <li css={navItemStyle}>
          <button
            type="button"
            css={
              currentPageLabel === PROPOSED_LC_MAPS_PAGE_LABEL
                ? navToggleActiveStyle
                : navToggleStyle
            }
            aria-expanded={isMapsExpanded}
            aria-current={
              currentPageLabel === PROPOSED_LC_MAPS_PAGE_LABEL
                ? "page"
                : undefined
            }
            onClick={() => setIsMapsExpanded((open) => !open)}
          >
            <span css={navToggleLabelGroupStyle}>
              <PinOutlined css={navIconStyle} />
              {REGION_NAV_LABEL}
            </span>
            <span aria-hidden="true">{isMapsExpanded ? "▾" : "▸"}</span>
          </button>

          {isMapsExpanded && (
            <ul css={regionListStyle}>
              {PHILIPPINE_REGIONS.map((region) => {
                const regionHasMap = (PROVINCES_BY_REGION[region] ?? []).some(
                  (province) =>
                    provincesWithMaps.has(regionProvinceKey(region, province)),
                );

                return (
                  <li key={region} css={navItemStyle}>
                    <button
                      type="button"
                      css={regionToggleStyle}
                      disabled={!regionHasMap}
                      title={
                        regionHasMap
                          ? undefined
                          : "No LC Map has been published for this region yet."
                      }
                      aria-expanded={expandedRegion === region}
                      onClick={() =>
                        setExpandedRegion((current) =>
                          current === region ? null : region,
                        )
                      }
                    >
                      <span>{region}</span>
                      <span aria-hidden="true">
                        {expandedRegion === region ? "▾" : "▸"}
                      </span>
                    </button>

                    {expandedRegion === region && (
                      <ul css={provinceListStyle}>
                        {(PROVINCES_BY_REGION[region] ?? []).map((province) => {
                          const hasMap = provincesWithMaps.has(
                            regionProvinceKey(region, province),
                          );

                          return (
                            <li key={province} css={navItemStyle}>
                              <button
                                type="button"
                                css={provinceLinkStyle}
                                disabled={!hasMap}
                                title={
                                  hasMap
                                    ? undefined
                                    : "No LC Map has been published for this province yet."
                                }
                                onClick={() =>
                                  goToProposedMapsFor(region, province)
                                }
                              >
                                {province}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      </ul>
    </Paper>
  );
}

export default Widget;
