import React from "react";
import { shallow } from "enzyme";
import { ExternalAuthorizations } from "@/components/mine/ExternalAuthorizations/ExternalAuthorizations";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.mineGuid = "12351235";
  props.mineEpicInfo = MOCK.MINE_EPIC_INFO.records;
  props.fetchMineEpicInformation = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
});

describe("ExternalAuthorizations", () => {
  it("renders properly", () => {
    const component = shallow(<ExternalAuthorizations {...props} />);
    expect(component).toMatchSnapshot();
  });
});
