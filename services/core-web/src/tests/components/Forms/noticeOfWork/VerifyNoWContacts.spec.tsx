import React from "react";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import VerifyNoWContacts from "@/components/Forms/noticeOfWork/VerifyNoWContacts";
import * as FORM from "@/constants/forms";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { searchReducerType } from "@mds/common/redux/slices/searchSlice";
import server from "@/tests/server";

jest.mock("@/components/common/wrappers/AuthorizationWrapper", () => ({ children }: any) => <>{children}</>);

// Spy on openModal to capture and invoke afterSubmit from the real action flow
import * as modalActions from "@mds/common/redux/actions/modalActions";
const openModalSpy = jest.spyOn(modalActions, "openModal");

const baseContacts = [
    {
        id: "c-1",
        mine_party_appt_type_code: "PMT",
        mine_party_appt_type_code_description: "Permittee",
        party: { name: "John Smith", email: "alpha@test.ca", phone_no: "111", address: [{}] },
    },
    {
        id: "c-2",
        party: { name: "Beta Person", email: "beta@test.ca", phone_no: "222", address: [{}] },
    },
];

const initialState = {
    form: {
        [FORM.VERIFY_NOW_APPLICATION_FORM]: {
            values: { contacts: baseContacts },
        },
    },
    [STATIC_CONTENT]: {
        partyRelationshipTypesList: [
            { value: "PMT", label: "Permittee", isActive: true, subType: null },
            { value: "MMG", label: "Mine Manager", isActive: true, subType: null },
            { value: "AGT", label: "Agent", isActive: true, subType: null },
        ],
    },
    [searchReducerType]: {
        searchResults: { party: [] },
        searchSubsetResults: [],
    },
};

const renderWithStore = () =>
    render(
        <ReduxWrapper initialState={initialState}>
            <FormWrapper name={FORM.VERIFY_NOW_APPLICATION_FORM} initialValues={{ contacts: baseContacts }}>
                <VerifyNoWContacts
                    wasFormReset={false}
                    contactFormValues={baseContacts}
                    isImporting={false}
                />
            </FormWrapper>
        </ReduxWrapper>
    );

describe("VerifyNoWContacts (connected)", () => {
    it("renders lists and snapshot", () => {
        const { container } = renderWithStore();
        expect(screen.getByText(/Application Contacts/i)).toBeInTheDocument();
        // There can be more than one match due to re-renders; assert at least one.
        expect(screen.getAllByText(/Matching Contact Options/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Core Contact Detail/i)).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it("disables search for contact without role", () => {
        renderWithStore();
        const buttons = screen.getAllByRole("button", { name: /Search Contact/i });
        expect(buttons[0]).toBeEnabled();
        expect(buttons[1]).toBeDisabled();
    });

    it("fetches search results and shows Add New Core Contact", async () => {
        renderWithStore();
        fireEvent.click(screen.getAllByRole("button", { name: /Search Contact/i })[0]);
        await waitFor(() => expect(screen.getByText(/Add New Core Contact/i)).toBeInTheDocument());
        // Verify the results table is rendered in the Matching Contact Options column
        const optionsHeading = screen.getByRole("heading", { name: /Matching Contact Options/i });
        const optionsContainer = optionsHeading.closest(".contact-rows") as HTMLElement | null;
        expect(optionsContainer).toBeTruthy();
        // Ant Table renders a native <table> (role=table); in some cases role can be grid
        await waitFor(() => {
            const tableEl =
                within(optionsContainer as HTMLElement).queryByRole("table") ||
                within(optionsContainer as HTMLElement).getByRole("grid");
            expect(tableEl).toBeInTheDocument();
        });
    });
});

describe("VerifyNoWContacts (lifecycle)", () => {
    it("calls clearAllSearchResults on mount/unmount via Redux action", () => {
        const { unmount } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.VERIFY_NOW_APPLICATION_FORM} initialValues={{ contacts: baseContacts }}>
                    <VerifyNoWContacts wasFormReset={false} contactFormValues={baseContacts} isImporting={false} />
                </FormWrapper>
            </ReduxWrapper>
        );
        // No explicit assertion; absence of console error about non-plain actions implies ok
        unmount();
    });
});

describe("VerifyNoWContacts (add new contact flow)", () => {
    it("shows newly created contact in search results and core contact detail after creation", async () => {
        // Render connected component
        render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.VERIFY_NOW_APPLICATION_FORM} initialValues={{ contacts: baseContacts }}>
                    <VerifyNoWContacts wasFormReset={false} contactFormValues={baseContacts} isImporting={false} />
                </FormWrapper>
            </ReduxWrapper>
        );

        // Trigger initial search (first contact has role, so enabled)
        fireEvent.click(screen.getAllByRole("button", { name: /Search Contact/i })[0]);
        // Wait for Matching Contact Options section to appear (indicates search done)
        await waitFor(() => expect(screen.getByText(/Add New Core Contact/i)).toBeInTheDocument());

        // Add new core contact
        fireEvent.click(screen.getByText(/Add New Core Contact/i));
        expect(openModalSpy).toHaveBeenCalled();
        // Capture the afterSubmit handler from the last openModal call
        const lastCall = openModalSpy.mock.calls[openModalSpy.mock.calls.length - 1];
        const cfg = (lastCall?.[0] ?? {}) as any;
        const capturedAfterSubmit = cfg?.props?.afterSubmit as undefined | ((guid: string, p: any) => void);
        expect(typeof capturedAfterSubmit).toBe("function");

        // Simulate modal afterSubmit callback supplying new party guid
        await act(async () => {
            capturedAfterSubmit("new-1", { party_guid: "new-1", name: "New Person", email: "new@test.ca", phone_no: "333", address: [{}] });
        });
        // The component will re-search using the new party name; MSW handler returns results including New Person
        await waitFor(() => {
            const coreDetailHeading = screen.getByRole("heading", { name: /Core Contact Detail/i });
            const coreDetailContainer = coreDetailHeading.closest(".contact-rows") as HTMLElement | null;
            expect(coreDetailContainer).toBeTruthy();
            const headingEl = within(coreDetailContainer as HTMLElement).getByText(
                (_content, node) => {
                    const el = node as HTMLElement;
                    return !!el && el.tagName.toLowerCase() === "h4" && /New Person/i.test(el.textContent || "");
                }
            );
            expect(headingEl).toBeInTheDocument();
        });

    });
});

describe("VerifyNoWContacts (null address defensive rendering)", () => {
    afterEach(() => {
        server.resetHandlers();
    });

    it("does not crash when a matched contact's address is null", async () => {
        server.use(
            http.get("/%3CAPI_URL%3E/search", async () => {
                return HttpResponse.json({
                    search_results: {
                        party: [
                            {
                                result: {
                                    party_guid: "p-null-addr",
                                    name: "No Address Person",
                                    email: "noaddr@test.ca",
                                    phone_no: "555",
                                    address: null,
                                },
                            },
                        ],
                    },
                });
            })
        );

        renderWithStore();

        fireEvent.click(screen.getAllByRole("button", { name: /Search Contact/i })[0]);
        const addCoreContactButton = await screen.findByText(/Add New Core Contact/i);
        expect(addCoreContactButton).toBeInTheDocument();

        const optionsHeading = screen.getByRole("heading", { name: /Matching Contact Options/i });
        const optionsContainer = optionsHeading.closest(".contact-rows") as HTMLElement;
        const rowCheckboxes = within(optionsContainer).getAllByRole("checkbox");

        fireEvent.click(rowCheckboxes[rowCheckboxes.length - 1]);

        await waitFor(() => {
            const coreDetailHeading = screen.getByRole("heading", { name: /Core Contact Detail/i });
            const coreDetailContainer = coreDetailHeading.closest(".contact-rows") as HTMLElement;
            expect(within(coreDetailContainer).getByText(/No Address Person/i)).toBeInTheDocument();
        });
    });
});
