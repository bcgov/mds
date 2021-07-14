import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitStatusModal } from "@/components/modalContent/ExplosivesPermitStatusModal";

const props = {};

const setupProps = () => {
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitStatusModal", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitStatusModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
