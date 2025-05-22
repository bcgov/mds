import React from "react";
import { render } from "@testing-library/react";
import { ExplosivesPermit } from "@/components/mine/ExplosivesPermit/ExplosivesPermit";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><BrowserRouter><ExplosivesPermit {...props} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
