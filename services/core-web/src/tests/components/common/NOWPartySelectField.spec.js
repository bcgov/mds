import React from "react";
import { shallow } from "enzyme";
import { NOWPartySelectField } from "@/components/common/NOWPartySelectField";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.setAddPartyFormState = jest.fn();
  dispatchProps.fetchSearchResultsThrottled = jest.fn();
  dispatchProps.fetchSearchResults = jest.fn();
};

const setupProps = () => {
  props.initialValues = { label: "Mock Party", value: "29489218432" };
  props.id = 1;
  props.label = "Party Select";
  props.placeholder = "select party";
  props.dataSource = [];
  props.selectedOption = {
    key: "mock key",
    label: "name",
    value: "mock name",
  };
  props.input = {
    value: "mock value",
    onChange: jest.fn(),
    onFocus: jest.fn(),
  };
  props.meta = {
    touched: false,
    error: "mock error",
    warning: "mock warning",
  };
  props.disabled = false;
  props.initialSearch = "mock name";
  props.name = "party_guid";
  props.person = true;
  props.organization = false;
  props.allowAddingParties = true;
  props.searchResults = {};
  props.lastCreatedParty = {};
  props.partyLabel = "contact";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("NOWPartySelectField", () => {
  it("renders properly", () => {
    const wrapper = shallow(<NOWPartySelectField {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
