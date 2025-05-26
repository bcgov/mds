import React from "react";
import { render } from "@testing-library/react";
import { ConditionLayerFive } from "@/components/Forms/permits/conditions/ConditionLayerFive";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const dispatchProps = {
  onSubmit: jest.fn(),
  handleCancel: jest.fn(),
  handleDelete: jest.fn(),
  reorderConditions: jest.fn(),
  setConditionEditingFlag: jest.fn(),
};
const props = {
  condition: { sub_conditions: [] },
  new: false,
  initialValues: {},
  editingConditionFlag: true,
  isViewOnly: false,
};
const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  },
};

describe("ConditionLayerFive", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <ConditionLayerFive {...dispatchProps} {...props} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
