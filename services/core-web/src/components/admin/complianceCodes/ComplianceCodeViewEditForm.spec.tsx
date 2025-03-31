import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import ComplianceCodeViewEditForm from "./ComplianceCodeViewEditForm";
import { COMPLIANCE_CODES } from "@mds/common/tests/mocks/dataMocks";
import { complianceCodeReducerType } from "@mds/common/redux/slices/complianceCodesSlice";

const initialState = {
    [complianceCodeReducerType]: {
        complianceCodeMap: {}
    }
};

describe("ComplianceCodeViewEditForm", () => {
    it("renders properly", async () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <ComplianceCodeViewEditForm initialValues={null} isEditMode onSave={jest.fn()} />
                <ComplianceCodeViewEditForm initialValues={COMPLIANCE_CODES[0]} isEditMode={false} onSave={jest.fn()} />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot()
    });
})