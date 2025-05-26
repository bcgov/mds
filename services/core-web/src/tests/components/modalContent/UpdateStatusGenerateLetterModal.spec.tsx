import React from "react";
import { shallow } from "enzyme";
import { UpdateStatusGenerateLetterModal } from "@/components/modalContent/UpdateStatusGenerateLetterModal";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  generateDocument: jest.fn(),
  preview: jest.fn(),
};
const props = {
  title: "Upload Documents",
  signature: true,
  issuingInspectorGuid: "62346234",
  noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  initialValues: {},
  documentType: "PMT",
  type: "PMT",
  exemptionFeeStatusCode: "Y",
  draftAmendment: {},
};

//  TypeError: Cannot read properties of undefined (reading 'form_spec')

//        99 |       )}
//       100 |       <Row gutter={16}>
//     > 101 |         <Col span={24}>{createFields(props.documentType.document_template.form_spec)}</Col>
//           |                                                                           ^
//       102 |       </Row>
//       103 |       <div className="right center-mobile">
//       104 |         <RenderCancelButton />
describe("UpdateStatusGenerateLetterModal", () => {
  it("renders properly", () => {
    const component = shallow(<UpdateStatusGenerateLetterModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
