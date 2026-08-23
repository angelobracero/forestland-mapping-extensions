import { React, jsx, type AllWidgetProps } from "jimu-core";

import { LayoutEntry } from "jimu-layouts/layout-runtime";

import type { Config } from "../config";

export default function Widget(props: AllWidgetProps<Config>) {
  const { layouts, builderSupportModules } = props;

  const LayoutComponent = !window.jimuConfig.isInBuilder
    ? LayoutEntry
    : builderSupportModules?.LayoutEntry;

  const layoutName = layouts ? Object.keys(layouts)[0] : undefined;

  return (
    <div
      className="custom-editor jimu-widget"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* YOUR CUSTOM UI */}

      <div
        style={{
          padding: "12px",
          background: "#f5f5f5",
          borderBottom: "1px solid #ddd",
        }}
      >
        <strong>My Custom Editor</strong>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* EMBEDDED WIDGET SLOT */}

        {LayoutComponent && layoutName && (
          <LayoutComponent
            className="custom-editor-layout"
            layouts={layouts[layoutName]}
            isInWidget
          />
        )}
      </div>
    </div>
  );
}
