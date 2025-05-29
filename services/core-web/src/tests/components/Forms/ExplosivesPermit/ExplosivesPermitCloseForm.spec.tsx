import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitCloseForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitCloseForm";

const props = {
  submitting: false,
  title: "Close Permit",
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};

describe("ExplosivesPermitCloseForm", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitCloseForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
