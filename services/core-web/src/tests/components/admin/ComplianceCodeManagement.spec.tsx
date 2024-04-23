import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ComplianceCodeManagement from "@/components/admin/complianceCodes/ComplianceCodeManagement";
import {
  complianceCodeReducerType,
  formatCode,
} from "@mds/common/redux/slices/complianceCodesSlice";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IComplianceArticle } from "@mds/common/interfaces";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import { SystemFlagEnum } from "@mds/common";

const initialState = {
  [complianceCodeReducerType]: {
    complianceCodeMap: MOCK.COMPLIANCE_CODES.records.map((code) =>
      formatCode((code as any) as IComplianceArticle)
    ),
  },
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_edit_compliance_codes],
  },
};

describe("PermitConditionsNavigation", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ComplianceCodeManagement />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
