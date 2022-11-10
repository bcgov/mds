import React from "react";
import { shallow } from "enzyme";
import { store } from "@/App";
import { Provider } from "react-redux";
import DamsPage from "../../../../../common/components/tailings/dam/DamsPage";

let props = {};
let dispatchProps = {};

const setupProps = () => {
  props = {
    tsf: {},
    initialValues: {},
    formValues: {},
    formErrors: {},
  };
};

const setupDispatchProps = () => {
  dispatchProps = {
    storeTsfs: jest.fn(),
    storeDam: jest.fn(),
    fetchMineRecordById: jest.fn(),
    fetchDam: jest.fn(),
  };
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DamsPage", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <DamsPage {...props} {...dispatchProps} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
