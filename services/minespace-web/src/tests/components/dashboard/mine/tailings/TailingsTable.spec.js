import { BrowserRouter } from "react-router-dom";
import React from "react";
import { shallow } from "enzyme";
import { TailingsTable } from "@/components/dashboard/mine/tailings/TailingsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {
  editTailings: jest.fn(),
  itrmExemptionStatusCodeHash: {},
  handleEditTailings: jest.fn(),
  openEditTailingsModal: jest.fn(),
};
const dispatchProps = {
  storeDam: jest.fn(),
  storeTsf: jest.fn(),
};

const setupProps = () => {
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.tailings =
    MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"].mine_tailings_storage_facilities;
  props.TSFOperatingStatusCodeHash = {};
  props.consequenceClassificationStatusCodeHash = {};
};

beforeEach(() => {
  setupProps();
});

describe("TailingsTable", () => {
  it("renders properly", () => {
    const component = shallow(
      <BrowserRouter>
        <TailingsTable {...props} {...dispatchProps} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
