import React from "react";
import { shallow } from "enzyme";
import { NOWProgressStatus } from "@/components/noticeOfWork/NOWProgressStatus";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.progressStatusHash = {};
  reducerProps.showProgress = true;
  reducerProps.progress = {};
  reducerProps.tab = "application";
  reducerProps.noticeOfWork = { notice_of_work_type_code: "PLA", application_type_code: "NOW" };
};

beforeEach(() => {
  setupReducerProps();
});

describe("NOWProgressStatus", () => {
  it("renders properly", () => {
    const component = shallow(
      <NOWProgressStatus {...reducerProps} match={{ params: { id: 1 } }} />
    );
    expect(component).toMatchSnapshot();
  });
});
