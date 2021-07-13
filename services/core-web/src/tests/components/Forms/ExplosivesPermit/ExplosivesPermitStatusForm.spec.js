import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitStatusForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitStatusForm";

const props = {};

const setupProps = () => {
  props.submitting = false;
  props.title = "Close Permit";
  props.handleSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.explosivesPermitStatusDropdownOptions = [];
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitStatusForm", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitStatusForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
