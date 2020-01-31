import React from "react";
import { shallow } from "enzyme";
import { Camps } from "@/components/noticeOfWork/applications/review/activities/Camps";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.camps;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("Camps", () => {
  it("renders properly", () => {
    const component = shallow(<Camps {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
