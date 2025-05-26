import React from "react";
import { shallow } from "enzyme";
import { ExplosivesPermitApplicationDecisionModal } from "@/components/modalContent/ExplosivesPermitApplicationDecisionModal";
import { IExplosivesPermitDocumentType } from "@mds/common/interfaces";
import { EXPLOSIVES_PERMITS } from "@mds/common/tests/mocks/dataMocks";


const props = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  previewDocument: jest.fn(),
  inspectors: [],
  documentType: "LET" as unknown as IExplosivesPermitDocumentType,
  initialValues: EXPLOSIVES_PERMITS.data.records[0]
};

describe("ExplosivesPermitApplicationDecisionModal", () => {
  it("renders properly", () => {
    const component = shallow(<ExplosivesPermitApplicationDecisionModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
