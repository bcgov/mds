import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitCloseModal } from "@/components/modalContent/ExplosivesPermitCloseModal";

const props = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};

describe("ExplosivesPermitCloseModal", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitCloseModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
