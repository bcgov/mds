import React from "react";
import { shallow } from "enzyme";
import { AddExplosivesPermitModal } from "@/components/modalContent/AddExplosivesPermitModal";

const props = {};

const setupProps = () => {
  props.isApproved = false;
  props.isPermitTab = false;
  props.title = "Permit";
  props.mineGuid = "523642546";
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.inspectors = [];
  props.initialValues = {};
  props.documentTypeDropdownOptions = [];
};

beforeEach(() => {
  setupProps();
});

describe("AddExplosivesPermitModal", () => {
  it("renders properly", () => {
    const component = shallow(<AddExplosivesPermitModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
