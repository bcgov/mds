import React from "react";
import * as MOCK from "@/tests/mocks/dataMocks";

import { render } from "@testing-library/react";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import { Provider } from "react-redux";
import { reducer as formReducer } from "redux-form";
import configureStore from "redux-mock-store";

import * as FORM from "@/constants/forms";
import { STATIC_CONTENT } from "@mds/common";

const dispatchProps: any = {};
const props: any = {};

const mockStore = configureStore({
  form: formReducer,
});

const store = mockStore({
  form: {
    ADD_MINE_MAJOR_APPLICATION: {
      values: {},
    },
  },
  STATIC_CONTENT,
});

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.project = MOCK.PROJECT;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MajorMineApplicationForm", () => {
  it("renders properly", () => {
    const { container } = render(
      <FormWrapper name={FORM.ADD_MINE_MAJOR_APPLICATION} onSubmit={() => {}}>
        <Provider store={store}>
          <MajorMineApplicationForm {...dispatchProps} {...props} />
        </Provider>
      </FormWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
