import React from "react";
import { shallow } from "enzyme";
import { Equipment } from "@/components/noticeOfWork/applications/review/activities/Equipment";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.equipment = NOW_MOCK.EQUIPMENT;
  reducerProps.isViewMode = false;
  reducerProps.activity = "TEST ACTIVITY";
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("Equipment", () => {
  it("renders view properly", () => {
    const component = shallow(<Equipment {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});

describe("Equipment", () => {
  it("renders edit properly", () => {
    const component = shallow(<Equipment isViewMode {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
