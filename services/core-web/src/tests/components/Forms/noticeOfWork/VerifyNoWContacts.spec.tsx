import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import VerifyNoWContacts, { VerifyNoWContacts as Unconnected } from "@/components/Forms/noticeOfWork/VerifyNoWContacts";
import * as FORM from "@/constants/forms";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

jest.mock("@/components/common/wrappers/AuthorizationWrapper", () => ({ children }: any) => <>{children}</>);

// Action creators that would hit API - mock only these (reduce but retain realism)
jest.mock("@mds/common/redux/actionCreators/searchActionCreator", () => ({
    fetchSearchResults: (term: string) => (dispatch: any) => {
        dispatch({ type: "SEARCH_REQUEST" });
        return Promise.resolve().then(() => {
            dispatch({
                type: "SEARCH_SUCCESS",
                payload: { search_results: { party: [{ result: { party_guid: "p-1", name: term, email: "x@test.ca", phone_no: "999", address: [{}] } }] } },
            });
        });
    },
    clearAllSearchResults: () => ({ type: "CLEAR_SEARCH" }),
}));

const baseContacts = [
    {
        id: "c-1",
        mine_party_appt_type_code: "PMT",
        mine_party_appt_type_code_description: "Permittee",
        party: { name: "Alpha Person", email: "alpha@test.ca", phone_no: "111", address: [{}] },
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
    staticContent: {
        partyRelationshipTypesList: [
            { value: "PMT", label: "Permittee" },
            { value: "MMG", label: "Mine Manager" },
            { value: "AGT", label: "Agent" },
        ],
    },
    search: {
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

describe("VerifyNoWContacts (unconnected lifecycle)", () => {
    it("calls clearAllSearchResults on mount/unmount", () => {
        const clearAllSearchResults = jest.fn();
        const { unmount } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.VERIFY_NOW_APPLICATION_FORM} initialValues={{ contacts: baseContacts }}>
                    <Unconnected
                        contactFormValues={baseContacts}
                        wasFormReset={false}
                        partyRelationshipTypesList={initialState.staticContent.partyRelationshipTypesList}
                        fetchSearchResults={jest.fn().mockResolvedValue({})}
                        clearAllSearchResults={clearAllSearchResults}
                        searchResults={{ party: [] }}
                        searchSubsetResults={[]}
                        change={jest.fn()}
                        updateParty={jest.fn()}
                        storeSubsetSearchResults={jest.fn()}
                        fetchPartyById={jest.fn()}
                        isImporting={false}
                        openModal={jest.fn()}
                        closeModal={jest.fn()}
                    />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(clearAllSearchResults).toHaveBeenCalledTimes(1);
        unmount();
        expect(clearAllSearchResults).toHaveBeenCalledTimes(2);
    });
});

describe("VerifyNoWContacts (unconnected add new contact flow)", () => {
    it("shows newly created contact in search results and core contact detail after creation", async () => {
        let searchResults: any = { party: [] };
        let searchSubsetResults: any[] = [];
        const fetchCalls: any[] = [];

        const fetchSearchResults = jest.fn().mockImplementation((term: string) => {
            const callIndex = fetchCalls.length;
            fetchCalls.push(term);
            const partyBase = [{ result: { party_guid: "p-1", name: term || "Alpha Person", email: "a@test.ca", phone_no: "111", address: [{}] } }];
            const partyExtended = [
                ...partyBase,
                { result: { party_guid: "new-1", name: "New Person", email: "new@test.ca", phone_no: "333", address: [{}] } },
            ];
            const data = { search_results: { party: callIndex === 0 ? partyBase : partyExtended } };
            return Promise.resolve({ data });
        });

        let capturedAfterSubmit: any = null;
        const openModal = jest.fn().mockImplementation((cfg) => {
            capturedAfterSubmit = cfg?.props?.afterSubmit;
        });
        const closeModal = jest.fn();

        const storeSubsetSearchResults = jest.fn().mockImplementation((subset: any[]) => {
            searchSubsetResults = subset;
            // If new party selected, also update full searchResults to include it (as store would)
            if (subset.some((s) => s.result.party_guid === "new-1")) {
                // Ensure searchResults mirrors extended list
                if (!searchResults.party.some((p: any) => p.result.party_guid === "new-1")) {
                    searchResults = {
                        party: [
                            ...searchResults.party,
                            { result: { party_guid: "new-1", name: "New Person", email: "new@test.ca", phone_no: "333", address: [{}] } },
                        ],
                    };
                }
            }
            const dynamicState = {
                form: {
                    [FORM.VERIFY_NOW_APPLICATION_FORM]: { values: { contacts: baseContacts } },
                },
                staticContent: initialState.staticContent,
                search: { searchResults, searchSubsetResults },
            };
            rerender(
                <ReduxWrapper initialState={dynamicState}>
                    <FormWrapper name={FORM.VERIFY_NOW_APPLICATION_FORM} initialValues={{ contacts: baseContacts }}>
                        <Unconnected
                            contactFormValues={baseContacts}
                            wasFormReset={false}
                            partyRelationshipTypesList={initialState.staticContent.partyRelationshipTypesList}
                            fetchSearchResults={fetchSearchResults}
                            clearAllSearchResults={jest.fn()}
                            searchResults={searchResults}
                            searchSubsetResults={searchSubsetResults}
                            change={jest.fn()}
                            updateParty={jest.fn()}
                            storeSubsetSearchResults={storeSubsetSearchResults}
                            fetchPartyById={jest.fn()}
                            isImporting={false}
                            openModal={openModal}
                            closeModal={closeModal}
                        />
                    </FormWrapper>
                </ReduxWrapper>
            );
        });

        const { rerender } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.VERIFY_NOW_APPLICATION_FORM} initialValues={{ contacts: baseContacts }}>
                    <Unconnected
                        contactFormValues={baseContacts}
                        wasFormReset={false}
                        partyRelationshipTypesList={initialState.staticContent.partyRelationshipTypesList}
                        fetchSearchResults={fetchSearchResults}
                        clearAllSearchResults={jest.fn()}
                        searchResults={searchResults}
                        searchSubsetResults={searchSubsetResults}
                        change={jest.fn()}
                        updateParty={jest.fn()}
                        storeSubsetSearchResults={storeSubsetSearchResults}
                        fetchPartyById={jest.fn()}
                        isImporting={false}
                        openModal={openModal}
                        closeModal={closeModal}
                    />
                </FormWrapper>
            </ReduxWrapper>
        );

        // Trigger initial search (first contact has role, so enabled)
        fireEvent.click(screen.getAllByRole("button", { name: /Search Contact/i })[0]);
        await waitFor(() => expect(fetchSearchResults).toHaveBeenCalledTimes(1));

        // Add new core contact
        fireEvent.click(screen.getByText(/Add New Core Contact/i));
        expect(openModal).toHaveBeenCalled();
        expect(typeof capturedAfterSubmit).toBe("function");

        // Simulate modal afterSubmit callback supplying new party guid
        capturedAfterSubmit("new-1", { party_guid: "new-1", name: "New Person", email: "new@test.ca", phone_no: "333", address: [{}] });
        await waitFor(() => expect(fetchSearchResults).toHaveBeenCalledTimes(2));

        // storeSubsetSearchResults should have been called with subset including new party
        await waitFor(() => expect(storeSubsetSearchResults).toHaveBeenCalled());
        await waitFor(() => {
            // Core contact detail should now include New Person
            const coreDetailHeading = screen.getByRole("heading", { name: /Core Contact Detail/i });
            const coreDetailContainer = coreDetailHeading.closest(".contact-rows") as HTMLElement | null;
            expect(coreDetailContainer).toBeTruthy();
            const headingEl = within(coreDetailContainer as HTMLElement).getByText(
                (_content, node) => {
                    const el = node as HTMLElement;
                    return (
                        !!el &&
                        el.tagName.toLowerCase() === "h4" &&
                        /New Person/i.test(el.textContent || "")
                    );
                }
            );
            expect(headingEl).toBeInTheDocument();
        });
    });
});
