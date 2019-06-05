import React from "react";
import { shallow } from "enzyme";
import { FetchOnMount } from "@/HOC/FetchOnMount";

const Component = FetchOnMount(() => <div>Test</div>);
const dispatchProps = {};

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
  dispatchProps.fetchProvinceCodes = jest.fn();
  dispatchProps.fetchMineComplianceCodes = jest.fn();
  dispatchProps.fetchVarianceStatusOptions = jest.fn();
  dispatchProps.fetchMineIncidentDeterminationOptions = jest.fn();
  dispatchProps.fetchMineCommodityOptions = jest.fn();
  dispatchProps.fetchPartyRelationshipTypes = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe("FetchOnMount", () => {
  it("should render", () => {
    const component = shallow(<Component.WrappedComponent {...dispatchProps} />);
    expect(component).toMatchSnapshot();
    expect(component.html()).toEqual("<div>Test</div>");
  });
});
