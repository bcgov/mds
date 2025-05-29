import React from "react";
import { render } from "@testing-library/react";
import { ConditionLayerFour } from "@/components/Forms/permits/conditions/ConditionLayerFour";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import * as MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

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

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mine_guid: "mine-guid",
      permit_guid: "permit-guid",
      id: "id-param",
      type: "type-param"
    }),
    useLocation: jest.fn()
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("ConditionLayerFour", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <ConditionLayerFour {...dispatchProps} {...props} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
