import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditNoticeOfWorkDocumentForm from "@/components/Forms/noticeOfWork/EditNoticeOfWorkDocumentForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { AUTHENTICATION, NOTICE_OF_WORK, PERMITS } from "@mds/common/constants/reducerTypes";
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

describe("EditNoticeOfWorkDocumentForm - remove-from-package reference warning", () => {
    const NOW_APPLICATION_GUID = "now-app-guid";
    const FILE_GUID = "figure-guid-123";

    afterEach(() => {
        jest.clearAllMocks();
        const { useFeatureFlag } = require("@mds/common/providers/featureFlags/useFeatureFlag");
        useFeatureFlag.mockReturnValue({ isFeatureEnabled: jest.fn().mockReturnValue(true) });
    });

    const stateWithCondition = (referencesFile: boolean) => ({
        ...authenticatedState(true),
        [NOTICE_OF_WORK]: {
            noticeOfWork: { now_application_guid: NOW_APPLICATION_GUID },
            applicationDelays: [],
        },
        [PERMITS]: {
            draftPermits: [
                {
                    permit_amendments: [
                        {
                            now_application_guid: NOW_APPLICATION_GUID,
                            permit_amendment_status_code: "DFT",
                            conditions: referencesFile
                                ? [{ condition: `See {permit_package_file:${FILE_GUID}}`, sub_conditions: [] }]
                                : [{ condition: "No reference here.", sub_conditions: [] }],
                        },
                    ],
                },
            ],
        },
    });

    const renderReferencedForm = (state: any) =>
        render(
            <ReduxWrapper initialState={state}>
                <EditNoticeOfWorkDocumentForm
                    {...baseProps}
                    initialValues={{
                        is_final_package: true,
                        now_application_document_xref_guid: FILE_GUID,
                    }}
                />
            </ReduxWrapper>
        );

    it("keeps the normal submit button when nothing has been unchecked yet", () => {
        renderReferencedForm(stateWithCondition(true));
        const submitButton = screen.getByRole("button", { name: baseProps.title });
        expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("keeps the normal submit button when unchecking a file that isn't referenced anywhere", async () => {
        renderReferencedForm(stateWithCondition(false));
        const checkbox = screen.getByRole("checkbox", { name: /Part of permit package/i });
        await userEvent.click(checkbox);
        const submitButton = screen.getByRole("button", { name: baseProps.title });
        expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("swaps in a confirm-guarded button when unchecking a file that is referenced in a condition", async () => {
        renderReferencedForm(stateWithCondition(true));
        const checkbox = screen.getByRole("checkbox", { name: /Part of permit package/i });
        await userEvent.click(checkbox);
        const submitButton = screen.getByRole("button", { name: baseProps.title });
        expect(submitButton).toHaveAttribute("type", "button");
    });

    it("shows the reference warning when the confirm-guarded button is clicked", async () => {
        renderReferencedForm(stateWithCondition(true));
        const checkbox = screen.getByRole("checkbox", { name: /Part of permit package/i });
        await userEvent.click(checkbox);
        const submitButton = screen.getByRole("button", { name: baseProps.title });
        await userEvent.click(submitButton);
        expect(
            screen.getByText(/This file is currently being referenced in a permit condition/i)
        ).toBeInTheDocument();
    });
});
