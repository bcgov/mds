import React from "react";
import { render } from "@testing-library/react";
import ExplosivesPermit from "@/components/mine/ExplosivesPermit/ExplosivesPermit";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { IExplosivesPermit, IMine, ItemMap } from "@mds/common/interfaces";

const props = {
  isPermitTab: false,
  mineGuid: "12351235",
  inspectors: [],
  mines: MOCK.MINES.mines,
  documentContextTemplate: {},
  explosivesPermits: MOCK.EXPLOSIVES_PERMITS.data.records.map((permit: Partial<IExplosivesPermit>, idx: number) => ({
    explosives_permit_id: permit.explosives_permit_id ?? `mock-id-${idx}`,
    ...permit,
  })) as IExplosivesPermit[],
  explosivesPermitStatusOptionsHash: {},
  explosivesPermitDocumentTypeDropdownOptions: [],
  explosivesPermitDocumentTypeOptionsHash: {},
  updateExplosivesPermit: jest.fn(),
  createExplosivesPermit: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchExplosivesPermits: jest.fn(),
  deleteExplosivesPermit: jest.fn(),
  fetchExplosivesPermitDocumentContextTemplate: jest.fn(),
  generateExplosivesPermitDocument: jest.fn(),
  createExplosivesPermitAmendment: jest.fn(),
  updateExplosivesPermitAmendment: jest.fn(),
};

describe("ExplosivesPermit", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <ExplosivesPermit {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
