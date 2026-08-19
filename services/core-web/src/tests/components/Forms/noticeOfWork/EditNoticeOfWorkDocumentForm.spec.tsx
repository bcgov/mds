import React from "react";
import { render, screen } from "@testing-library/react";
import EditNoticeOfWorkDocumentForm from "@/components/Forms/noticeOfWork/EditNoticeOfWorkDocumentForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import { Feature } from "@mds/common/utils/featureFlag";

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
    useFeatureFlag: jest.fn().mockReturnValue({ isFeatureEnabled: jest.fn().mockReturnValue(true) }),
}));

const baseProps = {
    onSubmit: jest.fn(),
    title: "Edit Notice of Work document",
    now_application_guid: "test-guid",
    isEditMode: true,
    isInCompleteStatus: false,
    categoriesToShow: [],
};

const authenticatedState = (hasEditPermits: boolean) => ({
    [AUTHENTICATION]: {
        userAccessData: hasEditPermits ? [USER_ROLES.role_edit_permits] : [],
    },
});

const renderForm = (isFinalPackage: boolean, state: any) =>
    render(
        <ReduxWrapper initialState={state}>
            <EditNoticeOfWorkDocumentForm
                {...baseProps}
                initialValues={{ is_final_package: isFinalPackage }}
            />
        </ReduxWrapper>
    );

describe("EditNoticeOfWorkDocumentForm - permit package document type selector", () => {
    afterEach(() => {
        jest.clearAllMocks();
        const { useFeatureFlag } = require("@mds/common/providers/featureFlags/useFeatureFlag");
        useFeatureFlag.mockReturnValue({ isFeatureEnabled: jest.fn().mockReturnValue(true) });
    });

    it("does not show the Document Type dropdown when Part of permit package is unchecked", () => {
        renderForm(false, authenticatedState(true));
        expect(screen.queryByText(/Document Type/i)).not.toBeInTheDocument();
    });

    it("shows the Document Type dropdown when checked, flag enabled, and user has edit_permits", () => {
        renderForm(true, authenticatedState(true));
        expect(screen.getByText(/Document Type/i)).toBeInTheDocument();
    });

    it("hides the Document Type dropdown when the user lacks the edit_permits role", () => {
        renderForm(true, authenticatedState(false));
        expect(screen.queryByText(/Document Type/i)).not.toBeInTheDocument();
    });

    it("hides the Document Type dropdown when the feature flag is disabled", () => {
        const { useFeatureFlag } = require("@mds/common/providers/featureFlags/useFeatureFlag");
        useFeatureFlag.mockReturnValue({
            isFeatureEnabled: jest
                .fn()
                .mockImplementation((feature) => feature !== Feature.INSPECTOR_PERMIT_PACKAGE_TYPE_SELECTOR),
        });
        renderForm(true, authenticatedState(true));
        expect(screen.queryByText(/Document Type/i)).not.toBeInTheDocument();
    });
});
