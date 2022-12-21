import * as MOCK from "@/tests/mocks/dataMocks";
import React from "react";
import { Provider } from "react-redux";
import { shallow } from "enzyme";
import { store } from "@/App";
import DamForm from "@common/components/tailings/dam/DamForm";

let props = {};
let dispatchProps = {};

const setupProps = () => {
  props = {
    tsf:
      MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"].mine_tailings_storage_facilities[0],
  };
};

const setupDispatchProps = () => {
  dispatchProps = {};
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DamsForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <DamForm {...props} {...dispatchProps} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
