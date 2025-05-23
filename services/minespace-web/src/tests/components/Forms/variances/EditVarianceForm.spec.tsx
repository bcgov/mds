import React from "react";
import { shallow } from "enzyme";
import { EditVarianceForm } from "@/components/Forms/variances/EditVarianceForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  removeDocument: jest.fn(),
};
const props = {
  submitting: false,
  mineGuid: "1738472",
  mineName: "mockMineName",
  variance: MOCK.VARIANCE,
  complianceCodesHash: MOCK.HSRCM_HASH,
  varianceStatusOptionsHash: MOCK.VARIANCE_STATUS_OPTIONS_HASH,
};

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
