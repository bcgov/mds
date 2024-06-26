import keycloak from "@mds/common/keycloak";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";

jest.mock("@mds/common/keycloak", () => ({
  default: {
    token: "mocked-token",
  },
}));

describe("createRequestHeader", () => {
  it("should create request headers with default and custom headers", () => {
    const customHeaders = {
      "Content-Type": "application/json",
    };

    const expectedHeaders = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${keycloak.token}`,
        "Content-Type": "application/json",
      },
    };

    const result = createRequestHeader(customHeaders);

    expect(result).toEqual(expectedHeaders);
  });

  it("should create request headers with default headers when no custom headers are provided", () => {
    const expectedHeaders = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${keycloak.token}`,
      },
    };

    const result = createRequestHeader();

    expect(result).toEqual(expectedHeaders);
  });
});
