import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { ChangeNOWLocationForm } from "@/components/Forms/noticeOfWork/ChangeNOWLocationForm";
import { NOW, MINES } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "mockTitle",
  submitting: false,
  locationOnly: true,
  mine: MINES.mines[0],
  latitude: "",
  longitude: "",
  noticeOfWork: NOW.applications[0],
};

// TODO: Issues with the map within the component
describe.skip("ChangeNOWLocationForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <ChangeNOWLocationForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});

describe("ChangeNOWLocationForm", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ChangeNOWLocationForm {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
