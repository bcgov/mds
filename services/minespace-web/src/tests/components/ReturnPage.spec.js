import React from "react";
import { shallow } from "enzyme";
import { ReturnPage } from "@/components/pages/ReturnPage";

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
  // TODO: FIX SSO MIGRATION TEST
  it.skip("renders properly", () => {
    const component = shallow(<ReturnPage />);
    expect(component).toMatchSnapshot();
  });
});
