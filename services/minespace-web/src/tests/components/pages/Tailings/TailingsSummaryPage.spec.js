import React from "react";
import { shallow } from "enzyme";
import { TailingsSummaryPage } from "@common/components/tailings/TailingsSummaryPage";
import TailingsProvider from "@common/components/tailings/TailingsProvider";
import * as MOCK from "@/tests/mocks/dataMocks";

let props = {};
let dispatchProps = {};

const setupProps = () => {
  props = {
    mines: MOCK.MINES.mines,
    TSFOperatingStatusCodeHash: {},
    consequenceClassificationStatusCodeHash: {},
    match: {
      params: {
        tab: "basic-information",
        mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
        tailingsStorageFacilityGuid: "e2629897-053e-4218-9299-479375e47f78",
      },
    },
    history: { push: jest.fn, replace: jest.fn },
    eors: [],
    location: { pathname: "" },
  };
};

const setupDispatchProps = () => {
  dispatchProps = {
    fetchPartyRelationships: jest.fn(),
    addDocumentToRelationship: jest.fn(),
    updateTailingsStorageFacility: jest.fn(),
    createTailingsStorageFacility: jest.fn(),
    addPartyRelationship: jest.fn(),
    fetchPermits: jest.fn(),
    fetchMineRecordById: jest.fn(),
    storeTsf: jest.fn(),
    clearTsf: jest.fn(),
    submit: jest.fn(),
  };
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("TailingsSummaryPage", () => {
  it("renders properly", () => {
    const component = shallow(
      <TailingsProvider>
        <TailingsSummaryPage {...props} {...dispatchProps} />
      </TailingsProvider>
    );
    expect(component).toMatchSnapshot();
  });
});
