import React from "react";
import { shallow } from "enzyme";
import { NOWSideMenu } from "@/components/noticeOfWork/applications/NOWSideMenu";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.history = { push: jest.fn() };
  reducerProps.location = {};
  reducerProps.tabSection = "application";
  reducerProps.noticeOfWork = { notice_of_work_type_code: "PLA", application_type_code: "NOW" };
};

beforeEach(() => {
  setupReducerProps();
});

describe("NOWSideMenu", () => {
  it("renders properly", () => {
    const component = shallow(<NOWSideMenu {...reducerProps} match={{ params: { id: 1 } }} />);
    expect(component).toMatchSnapshot();
  });
});
