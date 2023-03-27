import React from "react";
import { shallow } from "enzyme";
import { Index } from "../../index";
import Loading from "@/components/common/Loading";
import { getKeycloakMock } from "../mocks/keycloakMocks";
// import { waitFor } from '@testing-library/react';

// this handles the non-existence of the #root element in test environment
jest.mock("react-dom", () => {
  return {
    render: jest.fn(),
  };
});

const stateSetter = jest.fn();

// allows mock keycloak to have different properties in each test
beforeEach(() => {
  jest.resetModules();
});

it("Index: redirects unauthenticated to login", async () => {
  getKeycloakMock(true, false);
  const component = shallow(<Index />);
  jest
    .spyOn(React, "useState")
    .mockImplementation((stateValue) => [(stateValue = true), stateSetter]);

  // TODO: make this work
  // await waitFor(() => expect(getByText("MINES DIGITAL SERVICES (MDS) (PUBLIC CLIENT)")).toBeInTheDocument())
  // expect(component).toMatchSnapshot();
});

it("Index: shows loading before keycloak is instantiated", () => {
  const component = shallow(<Index />);
  expect(component.find(Loading).length).toEqual(1);
  expect(component).toMatchSnapshot();
});

it("Index: token is automatically refreshed while user is active", () => {
  getKeycloakMock();
  const component = shallow(<Index />);
  // modify the buffer time and idle timeout for a faster test -> 2 seconds?
  // mock an access token within keycloak -> set expiry for short period -> 5 seconds?
  // fire an action that registers as active (contenders: mousemove, keydown, focus)
  // it would try to refresh token after 3s (expiry - buffer)
  // EXPECT: handleUpdateToken was called
  // EXPECT: new token has different expiry
});

it("Index: token is not refreshed when user is not active", () => {
  getKeycloakMock();
  const component = shallow(<Index />);
  // similar to above, but do not fire action
  // EXPECT: handleUpdateToken was not called
  // EXPECT: token is the same
});
