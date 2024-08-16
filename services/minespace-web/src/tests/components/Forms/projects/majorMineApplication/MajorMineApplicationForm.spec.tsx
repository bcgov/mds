import React from "react";
import { render } from "@testing-library/react";

import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import * as MOCK from "@/tests/mocks/dataMocks";

import * as FORM from "@/constants/forms";
import { reduxForm } from "redux-form";
import { ReduxWrapper as CommonReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { ReduxWrapper as MinespaceReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

// const mockStore = configureStore([]);
// const store = mockStore({
//   form: {
//     ADD_MINE_MAJOR_APPLICATION: {
//       values: {
//         primary_documents: [],
//         spatial_documents: [],
//         supporting_documents: [],
//       },
//     },
//   },
//   MINES: {
//     mineDocuments: [],
//   },
//   AUTHENTICATION: true,
// });

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.project = MOCK.PROJECT;
  props.handleSubmit = jest.fn();
  props.refreshData = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

const DecoratedMajorMineApplicationForm = reduxForm({
  form: FORM.ADD_MINE_MAJOR_APPLICATION,
})(MajorMineApplicationForm as any);

describe("MajorMineApplicationForm", () => {
  it("renders properly", () => {
    const { container } = render(
      <CommonReduxWrapper initialState={{}}>
        <MinespaceReduxWrapper initialState={{}}>
          <BrowserRouter>
            <DecoratedMajorMineApplicationForm {...dispatchProps} {...props} />
          </BrowserRouter>
        </MinespaceReduxWrapper>
      </CommonReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
