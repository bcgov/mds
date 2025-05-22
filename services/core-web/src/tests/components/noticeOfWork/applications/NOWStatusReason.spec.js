import React from "react";
import { render } from "@testing-library/react";
import { NOWStatusReason } from "@/components/noticeOfWork/applications/NOWStatusReason";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOWMocks.NOW_APPLICATION_DELAY;
  reducerProps.noticeOfWorkApplicationStatusOptionsHash = NOWMocks.IMPORTED_NOTICE_OF_WORK;
};

beforeEach(() => {
  setupReducerProps();
});

describe("NOWStatusReason", () => {
  it("renders properly", () => {
    const { container: component } = render(<NOWStatusReason {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
