import React from "react";
import { shallow } from "enzyme";
import { ReturnPage } from "@/components/pages/ReturnPage";

const props = {
  location: { search: "type=login&code=blah" },
  redirect: "/",
};
const dispatchProps = {
  unAuthenticateUser: jest.fn(),
  authenticateUser: jest.fn(),
};

describe("ReturnPage", () => {
  // TODO: FIX SSO MIGRATION TEST
  it.skip("renders properly", () => {
    const component = shallow(<ReturnPage />);
    expect(component).toMatchSnapshot();
  });
});
