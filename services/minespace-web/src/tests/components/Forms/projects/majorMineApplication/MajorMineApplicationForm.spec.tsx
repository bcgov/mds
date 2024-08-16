import React from "react";
import { render } from "@testing-library/react";

import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import * as MOCK from "@/tests/mocks/dataMocks";

import * as FORM from "@/constants/forms";
import { reduxForm } from "redux-form";
import { ReduxWrapper as CommonReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

const mockStore = configureStore([]);
const initialState = {
  form: {
    ADD_MINE_MAJOR_APPLICATION: {
      values: {
        primary_documents: [],
        spatial_documents: [],
        supporting_documents: [],
      },
    },
  },
  MINES: {
    mineDocuments: [],
  },
  AUTHENTICATION: true,
};

const store = mockStore(initialState);
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

const MajorMineApplicationReduxForm = reduxForm({
  form: FORM.ADD_MINE_MAJOR_APPLICATION,
})(MajorMineApplicationForm as any);

const WrappedMajorMineApplicationForm = () => (
  <BrowserRouter>
    <CommonReduxWrapper initialState={initialState}>
      <Provider store={store}>
        <MajorMineApplicationReduxForm {...dispatchProps} {...props} />
      </Provider>
    </CommonReduxWrapper>
  </BrowserRouter>
);

describe("MajorMineApplicationForm", () => {
  it("renders properly", () => {
    const { container } = render(<WrappedMajorMineApplicationForm />);
    expect(container).toMatchSnapshot();
  });
});
