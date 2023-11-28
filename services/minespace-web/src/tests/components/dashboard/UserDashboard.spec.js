import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/App";
import { MinesPage } from "@/components/pages/MinesPage";

describe("UserDashboard", () => {
  it("renders properly", () => {
    const { container } = render(
      <Provider store={store}>
        <MinesPage />
      </Provider>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
