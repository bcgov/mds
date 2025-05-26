import React from "react";
import { render } from "@testing-library/react";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";
import { BrowserRouter } from "react-router-dom";

const props = {
  menuOptions: [{ href: "section-1", title: "Section #1" }],
  featureUrlRoute: jest.fn(),
  featureUrlRouteArguments: ["1stGuid", "2ndGuid"],
  match: { params: { id: "1234-4567-xwqy-j765" } },
  history: {
    push: jest.fn(),
    replace: jest.fn(),
    action: "",
    location: { hash: "1x4v6b8m" },
  },
  location: { hash: "1x4v6b8m" },
};

describe("ScrollSideMenu", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ScrollSideMenu {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
