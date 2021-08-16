import React from "react";
import { shallow } from "enzyme";
import { EPICAuthorizationsTable } from "@/components/mine/ExternalAuthorizations/EPICAuthorizationsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.isLoaded = false;
  props.data = MOCK.MINE_EPIC_INFO.records;
};

beforeEach(() => {
  setupProps();
});

describe("EPICAuthorizationsTable", () => {
  it("renders properly", () => {
    const component = shallow(<EPICAuthorizationsTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
