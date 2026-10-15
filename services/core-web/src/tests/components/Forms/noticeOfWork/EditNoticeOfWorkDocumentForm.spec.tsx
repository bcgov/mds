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

// antd's Popconfirm renders its overlay via rc-trigger, which needs real DOM measurement APIs
// jsdom doesn't provide - it never mounts its popup content in a test environment. This mock
// keeps the same open/title/onConfirm/onCancel/okText/cancelText contract but renders the
// overlay as plain DOM whenever `open` is true, so the controlled-visibility behavior under
// test (rather than antd's own popup positioning) can actually be asserted against.
jest.mock("antd", () => {
    const actual = jest.requireActual("antd");
    const Popconfirm = ({ open, title, onConfirm, onCancel, okText, cancelText, children }: any) => (
        <>
            {children}
            {open && (
                <div data-testid="popconfirm-mock">
                    <span>{title}</span>
                    <button type="button" onClick={onConfirm}>{okText}</button>
                    <button type="button" onClick={onCancel}>{cancelText}</button>
                </div>
            )}
        </>
    );
    return { ...actual, Popconfirm };
});

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

    it("keeps the submit button as a normal submit button regardless of reference state", () => {
        renderReferencedForm(stateWithCondition(true));
        const submitButton = screen.getByRole("button", { name: baseProps.title });
        expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("unchecks immediately, with no warning, for a file that isn't referenced anywhere", async () => {
        renderReferencedForm(stateWithCondition(false));
        const checkbox = screen.getByRole("checkbox", { name: /Part of permit package/i });
        await userEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(
            screen.queryByText(/This file is currently being referenced in a permit condition/i)
        ).not.toBeInTheDocument();
    });

    it("shows the reference warning immediately on uncheck, before the box actually changes, for a referenced file", async () => {
        renderReferencedForm(stateWithCondition(true));
        const checkbox = screen.getByRole("checkbox", { name: /Part of permit package/i });
        await userEvent.click(checkbox);
        expect(
            screen.getByText(/This file is currently being referenced in a permit condition/i)
        ).toBeInTheDocument();
        expect(checkbox).toBeChecked();
    });

    it("leaves the box checked when the user declines the warning", async () => {
        renderReferencedForm(stateWithCondition(true));
        const checkbox = screen.getByRole("checkbox", { name: /Part of permit package/i });
        await userEvent.click(checkbox);
        await userEvent.click(screen.getByText("No"));
        expect(checkbox).toBeChecked();
        expect(
            screen.queryByText(/This file is currently being referenced in a permit condition/i)
        ).not.toBeInTheDocument();
    });

    it("unchecks the box once the user confirms the warning", async () => {
        renderReferencedForm(stateWithCondition(true));
        const checkbox = screen.getByRole("checkbox", { name: /Part of permit package/i });
        await userEvent.click(checkbox);
        await userEvent.click(screen.getByText("Yes"));
        expect(checkbox).not.toBeChecked();
        expect(
            screen.queryByText(/This file is currently being referenced in a permit condition/i)
        ).not.toBeInTheDocument();
    });
});
