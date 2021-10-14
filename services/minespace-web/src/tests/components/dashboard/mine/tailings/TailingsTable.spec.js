import React from "react";
import { shallow } from "enzyme";
import { TailingsTable } from "@/components/dashboard/mine/tailings/TailingsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.tailings = MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"].mine_tailings_storage_facilities;
  props.TSFOperatingStatusCodeHash = {};
  props.consequenceClassificationStatusCodeHash = {};
};

beforeEach(() => {
  setupProps();
});

describe("TailingsTable", () => {
  it("renders properly", () => {
    const component = shallow(<TailingsTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
