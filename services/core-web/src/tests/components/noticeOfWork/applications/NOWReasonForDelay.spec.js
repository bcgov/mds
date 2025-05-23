import React from "react";
import { render } from "@testing-library/react";
import { NOWReasonForDelay } from "@/components/noticeOfWork/applications/NOWReasonForDelay";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {
  applicationDelay: NOWMocks.NOW_APPLICATION_DELAY[0],
  delayTypeOptionsHash: {},
};

describe("NOWReasonForDelay", () => {
  it("renders properly", () => {
    const { container: component } = render(<NOWReasonForDelay {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
