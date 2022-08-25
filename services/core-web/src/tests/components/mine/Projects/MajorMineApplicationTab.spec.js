import React from "react";
import { shallow } from "enzyme";
import { MajorMineApplicationTab } from "@/components/mine/Projects/MajorMineApplicationTab";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.project = MOCK.PROJECT;
  props.match = { params: { projectGuid: "1234-4567-xwqy" } };
  props.majorMineAppStatusCodesHash = MOCK.MAJOR_MINES_APPLICATION_STATUS_CODES_HASH;
};

const setupDispatchProps = () => {
  props.fetchProjectById = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProjectDocumentsTab", () => {
  it("renders properly", () => {
    const component = shallow(<MajorMineApplicationTab {...props} />);
    expect(component).toMatchSnapshot();
  });
});
