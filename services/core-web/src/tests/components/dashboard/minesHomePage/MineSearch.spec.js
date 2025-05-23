import React from "react";
import { render } from "@testing-library/react";
import { MineSearch } from "@/components/dashboard/minesHomePage/MineSearch";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  fetchMineNameList: jest.fn(),
  handleMineSearch: jest.fn(),
  handleCoordinateSearch: jest.fn(),
};
const props = {
  mineNameList: MOCK.MINE_NAME_LIST,
  isMapView: false,
  initialValues: {},
};

describe("MineSearch", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <MineSearch {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
