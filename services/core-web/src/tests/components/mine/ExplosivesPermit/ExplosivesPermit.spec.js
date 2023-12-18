import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermit } from "@/components/mine/ExplosivesPermit/ExplosivesPermit";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.isPermitTab = false;
  props.mineGuid = "12351235";
  props.inspectors = [];
  props.mines = [];
  props.documentContextTemplate = {};
  props.explosivesPermits = MOCK.EXPLOSIVES_PERMITS.data.records;
  props.explosivesPermitStatusOptionsHash = {};
  props.explosivesPermitDocumentTypeDropdownOptions = [];
  props.explosivesPermitDocumentTypeOptionsHash = {};

  props.updateExplosivesPermit = jest.fn();
  props.createExplosivesPermit = jest.fn();
  props.openModal = jest.fn();
  props.closeModal = jest.fn();
  props.fetchExplosivesPermits = jest.fn();
  props.deleteExplosivesPermit = jest.fn();
  props.fetchExplosivesPermitDocumentContextTemplate = jest.fn();
  props.generateExplosivesPermitDocument = jest.fn();
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermit", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermit {...props} />);
    expect(component).toMatchSnapshot();
  });
});
