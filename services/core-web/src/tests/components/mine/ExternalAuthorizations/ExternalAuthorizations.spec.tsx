import React from "react";
import { render } from "@testing-library/react";
import { ExternalAuthorizations } from "@/components/mine/ExternalAuthorizations/ExternalAuthorizations";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {
  mineGuid: "12351235",
  mineEpicInfo: MOCK.MINE_EPIC_INFO.records,
  fetchMineEpicInformation: jest.fn(() => Promise.resolve()),
};

describe("ExternalAuthorizations", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ExternalAuthorizations {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
