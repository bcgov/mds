import React from "react";
import { shallow } from "enzyme";
import { NOWSideMenu } from "@/components/noticeOfWork/applications/NOWSideMenu";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.history = { push: jest.fn() };
  reducerProps.location = {};
  reducerProps.noticeOfWorkType = "PLA";
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
