import React from "react";
import { shallow } from "enzyme";
import { ReturnPage } from "@/components/ReturnPage";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.location = { search: "type=login&code=blah" };
  props.redirect = "/";
};

const setupDispatchProps = () => {
  dispatchProps.unAuthenticateUser = jest.fn();
  dispatchProps.authenticateUser = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ReturnPage", () => {
  it("renders properly", () => {
    const component = shallow(<ReturnPage {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
