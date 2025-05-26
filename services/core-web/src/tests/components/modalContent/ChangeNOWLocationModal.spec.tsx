import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { ChangeNOWLocationModal } from "@/components/modalContent/ChangeNOWLocationModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  fetchMineRecordById: jest.fn(() => Promise.resolve({})),
};
const props = {
  title: "mockTitle",
  noticeOfWork: MOCK.NOW.applications[0],
  mineGuid: MOCK.MINES.mineIds[0],
};

// TODO: use the newer map, it doesn't run into this.
// TypeError: Cannot read properties of undefined (reading 'latitude')

//       48 |   // if mine does not have a location, set a default to center the map
//       49 |   latLong =
//     > 50 |     this.props.mine.mine_location.latitude && this.props.mine.mine_location.longitude
describe.skip("ChangeNOWLocationModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ChangeNOWLocationModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});

describe("ChangeNOWLocationModal", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ReduxWrapper><ChangeNOWLocationModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(wrapper).toMatchSnapshot();
  });
});
