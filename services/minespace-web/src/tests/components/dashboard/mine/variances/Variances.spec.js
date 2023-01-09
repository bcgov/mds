import React from "react";
import { shallow } from "enzyme";
import { Variances } from "@/components/dashboard/mine/variances/Variances";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.approvedVariances = MOCK.VARIANCES.records;
  props.varianceApplications = MOCK.VARIANCES.records;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
  props.complianceCodes = [];
  props.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  props.documentCategoryOptionsHash = MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.fetchVariancesByMine = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("Variances", () => {
  it("renders properly", () => {
    const component = shallow(<Variances {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
