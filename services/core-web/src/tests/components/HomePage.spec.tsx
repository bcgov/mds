import React from "react";
import { render } from "@testing-library/react";
import HomePage from "@/components/homepage/HomePage";
import { ReduxWrapper } from "../utils/ReduxWrapper";
import { ACTIVITIES } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [ACTIVITIES]: {
    activities: MOCK.ACTIVITIES.data.records,
    totalActivities: MOCK.ACTIVITIES.data.records.length,
  },
};

describe("HomePage", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
