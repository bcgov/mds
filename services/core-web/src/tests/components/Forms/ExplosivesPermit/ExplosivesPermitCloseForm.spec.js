import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitCloseForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitCloseForm";

const props = {};

const setupProps = () => {
  props.submitting = false;
  props.title = "Close Permit";
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitCloseForm", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitCloseForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
