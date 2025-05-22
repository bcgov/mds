import React from "react";
import { shallow } from "enzyme";
import { EditVarianceForm } from "@/components/Forms/variances/EditVarianceForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.submitting = false;
  props.mineGuid = "1738472";
  props.mineName = "mockMineName";
  props.variance = MOCK.VARIANCE;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
  props.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.removeDocument = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

// TypeError: Cannot read properties of undefined (reading 'undefined')

//       62 |     className,
//       63 |     key: dataIndex,
//     > 64 |     render: (text: string) => <div title={title}>{categoryMap[text] ?? placeHolder}</div>,
//          |                                                              ^
//       65 |     ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
//       66 |   };
//       67 | };
describe("EditVarianceForm", () => {
  it("renders properly", () => {
    const component = shallow(<EditVarianceForm {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
