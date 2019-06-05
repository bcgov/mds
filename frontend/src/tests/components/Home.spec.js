import React from "react";
import { shallow } from "enzyme";
import { Home } from "@/components/Home";

const props = {};
const dispatchProps = {};

const setupReducerProps = () => {
  props.location = { pathname: " " };
  props.optionsLoaded = true;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineDisturbanceOptions = jest.fn();
  dispatchProps.fetchStatusOptions = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchMineTenureTypes = jest.fn();
  dispatchProps.fetchMineTailingsRequiredDocuments = jest.fn();
  dispatchProps.fetchExpectedDocumentStatusOptions = jest.fn();
  dispatchProps.fetchPermitStatusOptions = jest.fn();
  dispatchProps.fetchApplicationStatusOptions = jest.fn();
  dispatchProps.fetchMineIncidentFollowActionOptions = jest.fn();
  dispatchProps.setOptionsLoaded = jest.fn();
  dispatchProps.fetchProvinceCodes = jest.fn();
  dispatchProps.fetchMineComplianceCodes = jest.fn();
  dispatchProps.fetchVarianceStatusOptions = jest.fn();
  dispatchProps.fetchMineIncidentDeterminationOptions = jest.fn();
  dispatchProps.fetchMineCommodityOptions = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
  setupDispatchProps();
});

describe("Home", () => {
  it("renders properly", () => {
    const component = shallow(<Home {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
