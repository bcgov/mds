import React from "react";
import { render } from "@testing-library/react";
import { MineTailingsDetailsPage } from "@/components/mine/Tailings/MineTailingsDetailsPage";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
    }),
    useHistory: jest.fn()
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("MineTailingsDetailsPage", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MineTailingsDetailsPage /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
