import React from "react";
import { render } from "@testing-library/react";
import { NOWStatusReason } from "@/components/noticeOfWork/applications/NOWStatusReason";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {
  noticeOfWork: NOWMocks.NOW_APPLICATION_DELAY,
  noticeOfWorkApplicationStatusOptionsHash: Object.fromEntries(
    Object.entries(NOWMocks.IMPORTED_NOTICE_OF_WORK).map(([k, v]) => [k, String(v)])
  ),
};

describe("NOWStatusReason", () => {
  it("renders properly", () => {
    const { container: component } = render(<NOWStatusReason {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
