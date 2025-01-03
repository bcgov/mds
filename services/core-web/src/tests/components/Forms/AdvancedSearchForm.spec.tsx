import React from "react";
import { render } from "@testing-library/react";
import { AdvancedMineSearchForm } from "@/components/Forms/AdvancedMineSearchForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { ACTIVITIES } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";


const initialState = {
  [ACTIVITIES]: {
    activities: MOCK.ACTIVITIES.data.records,
    totalActivities: MOCK.ACTIVITIES.data.records.length,
  },
};

describe("AdvancedMineSearchForm", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <AdvancedMineSearchForm
          initialValues={{}}
          onSubmit={jest.fn()}
          onReset={jest.fn()}
        /></ReduxWrapper>);
    expect(container).toMatchSnapshot();
  });
});
