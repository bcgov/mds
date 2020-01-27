import React from "react";
import { shallow } from "enzyme";
import { PartySelectField } from "@/components/common/PartySelectField";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchSearchResults = jest.fn();
};

const setupProps = () => {};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("PartySelectField", () => {
  it("renders properly", () => {
    const wrapper = shallow(<PartySelectField {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
