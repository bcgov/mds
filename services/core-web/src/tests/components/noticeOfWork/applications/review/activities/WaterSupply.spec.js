import React from "react";
import { shallow } from "enzyme";
import { WaterSupply } from "@/components/noticeOfWork/applications/review/activities/WaterSupply";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.water_supply;
};

beforeEach(() => {
  setupReducerProps();
});

describe("WaterSupply", () => {
  it("renders properly", () => {
    const component = shallow(<WaterSupply {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
