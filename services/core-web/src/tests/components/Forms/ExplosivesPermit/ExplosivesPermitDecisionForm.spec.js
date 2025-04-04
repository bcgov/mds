import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitDecisionForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitDecisionForm";

const props = {};

const setupProps = () => {
  props.submitting = false;
  props.title = "Close Permit";
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.previewDocument = jest.fn();
  props.inspectors = [];
  props.formValues = {};
  props.documentType = {
    document_template: {
      form_spec: [],
    },
  };
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitDecisionForm", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitDecisionForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
