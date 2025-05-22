import React from "react";
import { shallow } from "enzyme";
import { UpdateStatusGenerateLetterModal } from "@/components/modalContent/UpdateStatusGenerateLetterModal";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.generateDocument = jest.fn();
  dispatchProps.preview = jest.fn();
};

const setupProps = () => {
  props.title = "Upload Documents";
  props.signature = true;
  props.issuingInspectorGuid = "62346234";
  props.noticeOfWork = NOW_MOCK.IMPORTED_NOTICE_OF_WORK;
  props.initialValues = {};
  props.documentType = "PMT";
  props.type = "PMT";
  props.exemptionFeeStatusCode = "Y";
  props.draftAmendment = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

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
