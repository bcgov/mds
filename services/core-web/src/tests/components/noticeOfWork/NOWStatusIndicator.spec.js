import React from "react";
import { shallow } from "enzyme";
import { NOWStatusIndicator } from "@/components/noticeOfWork/NOWStatusIndicator";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.applicationDelay = {};
  reducerProps.progress = {};
  reducerProps.delayTypeOptionsHash = {};
  reducerProps.tabSection = "application";
  reducerProps.noticeOfWork = { notice_of_work_type_code: "PLA", application_type_code: "NOW" };
  reducerProps.isEditMode = false;
  reducerProps.type = "NOW";
};

beforeEach(() => {
  setupReducerProps();
});

describe("NOWStatusIndicator", () => {
  it("renders properly", () => {
    const component = shallow(
      <NOWStatusIndicator {...reducerProps} match={{ params: { id: 1 } }} />
    );
    expect(component).toMatchSnapshot();
  });
});
