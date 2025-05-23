import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitApplicationDecisionModal } from "@/components/modalContent/ExplosivesPermitApplicationDecisionModal";

const props = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  previewDocument: jest.fn(),
  inspectors: [],
  initialValues: {},
  documentType: "LET",
};

describe("ExplosivesPermitApplicationDecisionModal", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitApplicationDecisionModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
