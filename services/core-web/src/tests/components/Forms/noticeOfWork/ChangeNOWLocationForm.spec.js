import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { ChangeNOWLocationForm } from "@/components/Forms/noticeOfWork/ChangeNOWLocationForm";
import { NOW, MINES } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
  props.locationOnly = true;
  props.mine = MINES.mines[0];
  props.latitude = "";
  props.longitude = "";
  props.noticeOfWork = NOW.applications[0];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

// TODO: use the newer map, it doesn't run into this.
// TypeError: Cannot read properties of undefined (reading 'latitude')

//       48 |   // if mine does not have a location, set a default to center the map
//       49 |   latLong =
//     > 50 |     this.props.mine.mine_location.latitude && this.props.mine.mine_location.longitude
describe.skip("ChangeNOWLocationForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ChangeNOWLocationForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});

describe("ChangeNOWLocationForm", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ChangeNOWLocationForm {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
