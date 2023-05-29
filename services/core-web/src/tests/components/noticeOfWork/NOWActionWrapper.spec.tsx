import React from "react";
import { shallow } from "enzyme";
import { NOWActionWrapper } from "@/components/noticeOfWork/NOWActionWrapper";

const reducerProps: any = {};

const setupReducerProps = () => {
  reducerProps.children = <></>;
  reducerProps.history = { push: jest.fn() };
  reducerProps.progress = {};
  reducerProps.tab = "application";
  reducerProps.noticeOfWork = { notice_of_work_type_code: "PLA", application_type_code: "NOW" };
  reducerProps.applicationDelay = {};
  reducerProps.allowAfterProcess = true;
  reducerProps.location = {
    pathname: "mock path name",
  };
  reducerProps.isDisabledReviewButton = true;
};

beforeEach(() => {
  setupReducerProps();
});

describe("NOWActionWrapper", () => {
  it("renders properly", () => {
    const component = shallow(<NOWActionWrapper {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
