import React from "react";
import { shallow } from "enzyme";
import { AddCondition } from "@/components/Forms/permits/conditions/AddCondition";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.setEditingConditionFlag = jest.fn();
  dispatchProps.createPermitCondition = jest.fn();
  dispatchProps.fetchPermitConditions = jest.fn();
  dispatchProps.fetchDraftPermitByNOW = jest.fn();
  dispatchProps.fetchStandardPermitConditions = jest.fn();
  dispatchProps.createStandardPermitCondition = jest.fn();
};

const setupProps = () => {
  props.AddCondition = [];
  props.permitConditionCategoryOptions = [];
  props.editingConditionFlag = false;
  props.isNoWApplication = true;
  props.hasSourceAddCondition = true;
  props.draftPermitAmendment = {};
  props.initialValues = {};
  props.draftPermitAmendment = {};
  props.match = {};
  props.location = { pathname: "" };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      id: "8729830e-5e9a-4be8-9eef-dac4af775f1d"
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("AddCondition", () => {
  it("renders properly", () => {
    const component = shallow(<AddCondition {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
