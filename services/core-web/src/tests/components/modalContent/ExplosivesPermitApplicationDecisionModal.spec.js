import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitApplicationDecisionModal } from "@/components/modalContent/ExplosivesPermitApplicationDecisionModal";

const props = {};

const setupProps = () => {
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.previewDocument = jest.fn();
  props.inspectors = [];
  props.initialValues = {};
  props.documentType = "LET";
};

beforeEach(() => {
  setupProps();
});

// TypeError: Cannot read properties of undefined (reading 'form_spec')

//       72 |             validate={[required]}
//       73 |           />
//     > 74 |           {documentType.document_template.form_spec
//          |                                           ^
//       75 |             .filter((field) => !field["read-only"])
//       76 |             .map((field) => (
//       77 |               <Form.Item key={field.id}>{getGenerateDocumentFormField(field)}</Form.Item>
describe("ExplosivesPermitApplicationDecisionModal", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitApplicationDecisionModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
