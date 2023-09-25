import React from "react";
import { shallow } from "enzyme";
import MineExplosivesPermitTable from "@/components/mine/ExplosivesPermit/MineExplosivesPermitTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.isPermitTab = false;
  props.isLoaded = false;
  props.expandedRowKeys = [];
  props.data = MOCK.EXPLOSIVES_PERMITS.data.records;
  props.explosivesPermitStatusOptionsHash = {};
  props.explosivesPermitDocumentTypeDropdownOptions = [];
  props.explosivesPermitDocumentTypeOptionsHash = {};

  props.onExpand = jest.fn();
  props.handleOpenExplosivesPermitDecisionModal = jest.fn();
  props.handleOpenExplosivesPermitStatusModal = jest.fn();
  props.handleDeleteExplosivesPermit = jest.fn();
  props.handleOpenAddExplosivesPermitModal = jest.fn();
  props.handleOpenViewMagazineModal = jest.fn();
  props.handleOpenExplosivesPermitCloseModal = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("MineExplosivesPermitTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineExplosivesPermitTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
