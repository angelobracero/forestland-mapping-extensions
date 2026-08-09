import { React } from "jimu-core";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import { MapWidgetSelector } from "jimu-ui/advanced/setting-components";

export default function Setting(props: AllWidgetSettingProps<any>) {
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");
  console.log("Hello World");

  return (
    <div style={{ padding: "12px" }}>
      <MapWidgetSelector
        useMapWidgetIds={props.useMapWidgetIds}
        onSelect={(useMapWidgetIds) => {
          props.onSettingChange({
            id: props.id,
            useMapWidgetIds,
          });
        }}
      />
    </div>
  );
}
