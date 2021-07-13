import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitApplicationDecisionModal } from "@/components/modalContent/ExplosivesPermitApplicationDecisionModal";

const props = {};

const setupProps = () => {
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.previewDocument = jest.fn();
  props.inspectors = [];
  props.initialValues = {};
  props.documentType = "LET";
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitApplicationDecisionModal", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitApplicationDecisionModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
