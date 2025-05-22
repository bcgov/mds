import React from "react";
import { render } from "@testing-library/react";
import { MineSearch } from "@/components/dashboard/minesHomePage/MineSearch";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><MineSearch {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
