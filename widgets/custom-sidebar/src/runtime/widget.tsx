import "./style.scss";
import namrialogo from "./assets/namria-logo.png";
import { React, type AllWidgetProps, type State } from "jimu-core";
import { useSelector } from "react-redux";

const Widget = (props: AllWidgetProps<any>) => {
  const pages = useSelector((state: State) => state.appConfig.pages);

  const goToPage = (pageName: string) => {
    const page = Object.values(pages).find(
      (page: any) => page.label === pageName,
    );

    if (!page) {
      console.error(`Page "${pageName}" not found`);
      return;
    }

    console.log("Page ID:", page.id);

    // Navigation will go here
  };

  return (
    <aside className="custom-sidebar jimu-widget">
      <div className="img-container">
        <img src={namrialogo} alt="NAMRIA" />
      </div>

      <nav>
        <ul>
          <li onClick={() => goToPage("Home")}>Home</li>

          <li onClick={() => goToPage("About")}>About</li>

          <li onClick={() => goToPage("Gender and Development")}>
            Gender and Development
          </li>

          <li onClick={() => goToPage("LCD in Action")}>LCD in Action</li>

          <li onClick={() => goToPage("Guides and Tutorials")}>
            Guides and Tutorials
          </li>

          <li onClick={() => goToPage("Proposed LC Maps1")}>
            Proposed LC Maps
          </li>

          <li onClick={() => goToPage("View feedbacks")}>View Feedbacks</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Widget;
