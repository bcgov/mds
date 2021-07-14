import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitCloseModal } from "@/components/modalContent/ExplosivesPermitCloseModal";

const props = {};

const setupProps = () => {
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitCloseModal", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitCloseModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
