import React from "react";
import { shallow } from "enzyme";
import { MineSearch } from "@/components/dashboard/minesHomePage/MineSearch";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineNameList = jest.fn();
  dispatchProps.handleMineSearch = jest.fn();
  dispatchProps.handleCoordinateSearch = jest.fn();
};

const setupProps = () => {
  props.mineNameList = MOCK.MINE_NAME_LIST;
  props.isMapView = false;
  props.initialValues = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineSearch", () => {
  it("renders properly", () => {
    const component = shallow(<MineSearch {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
