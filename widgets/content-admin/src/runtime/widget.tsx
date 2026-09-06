import { type AllWidgetProps, getAppStore } from "jimu-core";
import { useEffect, useState } from "react";
import { Paper } from "jimu-ui";
import {
  SUPER_ADMIN_USERNAMES,
  checkIsContentAdmin,
} from "widgets/shared-code/admin-auth";

import {
  containerStyle,
  headerStyle,
  titleStyle,
  dividerStyle,
  subtitleStyle,
  deniedStyle,
  tabBarStyle,
  tabButtonStyle,
  tabButtonActiveStyle,
} from "./style";
import { TABLES, ADMINS_TABLE } from "./tables";
import { AdminTableSection } from "./components/AdminTableSection";
import { LcMapsSection } from "./components/LcMapsSection";

// LC Maps isn't a generic AdminTableSection tab -- publishing a shapefile
// writes to two different ArcGIS items (the new hosted feature layer, then
// a catalog row pointing at it), not one row on one table -- so it gets its
// own tab id and its own component instead of a TableDef.
const LC_MAPS_TAB_ID = "lcmaps";

function Widget(props: AllWidgetProps<any>) {
  const [activeTableId, setActiveTableId] = useState<string>(TABLES[0].id);
  const [authStatus, setAuthStatus] = useState<"checking" | "authorized" | "denied">(
    "checking",
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const currentUsername = getAppStore().getState().portalSelf?.user?.username;
      const isAdmin = await checkIsContentAdmin(currentUsername);

      if (!cancelled) {
        setAuthStatus(isAdmin ? "authorized" : "denied");
        setIsSuperAdmin(Boolean(currentUsername && SUPER_ADMIN_USERNAMES.includes(currentUsername)));
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  if (authStatus !== "authorized") {
    return (
      <Paper className="jimu-widget" component="main">
        <div css={containerStyle}>
          <div css={headerStyle}>
            <h2 css={titleStyle}>Content Admin</h2>
            <div css={dividerStyle} />
          </div>
          <div css={deniedStyle}>
            {authStatus === "checking"
              ? "Checking access..."
              : "You don't have access to this page."}
          </div>
        </div>
      </Paper>
    );
  }

  const visibleTables = isSuperAdmin ? [...TABLES, ADMINS_TABLE] : TABLES;
  const tabs = [
    ...visibleTables.map((table) => ({ id: table.id, label: table.label })),
    { id: LC_MAPS_TAB_ID, label: "LC Maps" },
  ];
  const activeTable = visibleTables.find((t) => t.id === activeTableId);

  return (
    <Paper className="jimu-widget" component="main">
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h2 css={titleStyle}>Content Admin</h2>
          <div css={dividerStyle} />
          <p css={subtitleStyle}>
            Add, edit, or remove the entries shown on the GAD, LCD in Action,
            and About pages.
          </p>
        </div>

        <div css={tabBarStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              css={[
                tabButtonStyle,
                tab.id === activeTableId && tabButtonActiveStyle,
              ]}
              onClick={() => setActiveTableId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTableId === LC_MAPS_TAB_ID ? (
          <LcMapsSection isSuperAdmin={isSuperAdmin} />
        ) : (
          <AdminTableSection
            key={activeTable?.id ?? visibleTables[0].id}
            tableDef={activeTable ?? visibleTables[0]}
          />
        )}
      </div>
    </Paper>
  );
}

export default Widget;
