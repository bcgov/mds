import React from "react";
import { fireEvent, render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import FormWrapper from "../../forms/FormWrapper";
import EnvDocumentsTab from "./EnvDocumentsTab";
import { BrowserRouter } from "react-router-dom";
import { FORM } from "@mds/common/constants/forms";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => {
    const actualReactRedux = jest.requireActual("react-redux");
    return {
        ...actualReactRedux,
        useDispatch: () => mockDispatch,
    };
});

// The document_manager_guid of the first document in AMS_FINAL_APPLICATION.documents
const EXISTING_DOC_MANAGER_GUID = "8f324863-0d45-4356-befd-2e3f650c3dc9";

jest.mock("@mds/common/components/forms/RenderFileUpload", () => (props: any) => (
    <button
        data-testid="remove-file-btn"
        onClick={() => props.onRemoveFile?.(null, { serverId: EXISTING_DOC_MANAGER_GUID })}
    >
        Remove File
    </button>
));

const initialState = {};

function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            projectSummaryGuid: "70414192-ca71-4d03-93a5-630491e9c554",
        }),
    };
};

jest.mock("react-router-dom", () => mockFunction());

const renderEnvDocumentsTab = (initialValues = MOCK.AMS_FINAL_APPLICATION) =>
    render(
        <BrowserRouter>
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.ADD_EDIT_AMS_FINAL_APPLICATION} initialValues={initialValues}>
                    <EnvDocumentsTab />
                </FormWrapper>
            </ReduxWrapper>
        </BrowserRouter>
    );

describe("EnvDocumentsTab", () => {
    beforeEach(() => {
        mockDispatch.mockClear();
    });

    it("renders properly", () => {
        const { container } = renderEnvDocumentsTab();
        expect(container).toMatchSnapshot();
    });

    it("does not render the saved documents section when no documents have a mine_document_guid", () => {
        const valuesWithUnsavedDocs = {
            ...MOCK.AMS_FINAL_APPLICATION,
            documents: [{ document_name: "unsaved.pdf", document_manager_guid: "some-guid-no-mine-doc" }],
        };
        const { queryByText } = renderEnvDocumentsTab(valuesWithUnsavedDocs);
        expect(queryByText("Uploaded Documents")).toBeNull();
    });

    it("dispatches arrayRemove when removing a file that matches an existing document", () => {
        const { getByTestId } = renderEnvDocumentsTab();
        fireEvent.click(getByTestId("remove-file-btn"));
        expect(mockDispatch).toHaveBeenCalled();
    });
});
