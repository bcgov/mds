import React from "react";
import { shallow } from "enzyme";
import { Equipment } from "@/components/noticeOfWork/applications/review/activities/Equipment";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.equipment = NOW_MOCK.EQUIPMENT;
};

beforeEach(() => {
  setupReducerProps();
});

describe("Equipment", () => {
  it("renders properly", () => {
    const component = shallow(<Equipment {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
