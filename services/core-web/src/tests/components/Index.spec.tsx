import React from "react";
import { render } from "@testing-library/react";
import { Index } from "../../index";
import { MessageChannel } from "worker_threads";

{/* @ts-ignore issue with MessageChannel */ }
window.MessageChannel = MessageChannel;

jest.mock("@mds/common/keycloak", () => ({
  default: {
    token: "mocked-token",
  },
  keycloak: {
    init: jest.fn(),
    authenticated: Boolean,
    login: jest.fn(),
    tokenParsed: {
      client_roles: []
    }
  }
}));


it("Index: shows loading before keycloak is instantiated", () => {
  const { container } = render(<Index disableEnvLoading={true} />);
  expect(container).toMatchSnapshot();
});
