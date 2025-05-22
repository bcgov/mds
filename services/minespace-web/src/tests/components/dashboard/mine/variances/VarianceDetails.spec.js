import React from "react";
import { shallow } from "enzyme";
import { VarianceDetails } from "@/components/dashboard/mine/variances/VarianceDetails";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.removeDocument = jest.fn();
};
const setupProps = () => {
  props.variance = MOCK.VARIANCE;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
  props.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  props.mineName = "mockMineName";
  props.isViewOnly = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

// TypeError: Cannot read properties of undefined (reading 'undefined')

//       62 |     className,
//       63 |     key: dataIndex,
//     > 64 |     render: (text: string) => <div title={title}>{categoryMap[text] ?? placeHolder}</div>,
//          |                                                              ^
//       65 |     ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
//       66 |   };
//       67 | };
describe("VarianceDetails", () => {
  it("renders properly", () => {
    const component = shallow(<VarianceDetails {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
