import React from "react";
import { shallow } from "enzyme";
import { ExternalAuthorizationsTable } from "@/components/mine/ExternalAuthorizations/ExternalAuthorizationsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.isLoaded = false;
  props.data = MOCK.MINE_EPIC_INFO.records;
};

beforeEach(() => {
  setupProps();
});

describe("ExternalAuthorizationsTable", () => {
  it("renders properly", () => {
    const component = shallow(<ExternalAuthorizationsTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
