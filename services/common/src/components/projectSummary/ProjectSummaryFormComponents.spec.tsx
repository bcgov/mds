import React from "react";
import { render } from "@testing-library/react";
import FormWrapper from "../forms/FormWrapper";
import { FORM, SystemFlagEnum } from "@mds/common/constants";
import { ProjectManagement } from "./ProjectManagement";
import { LegalLandOwnerInformation } from "./LegalLandOwnerInformation";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { AUTHENTICATION, PERMITS, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { exportForTesting } from "@mds/common/redux/selectors/projectSelectors";
import BasicInformation from "./BasicInformation";
import ProjectLinks from "./ProjectLinks";
import ProjectContacts from "./ProjectContacts";
import ProjectDates from "./ProjectDates";
import Applicant from "./Applicant";
import { Agent } from "./Agent";
import { ApplicationSummary } from "./ApplicationSummary";
import AuthorizationsInvolved from "./AuthorizationsInvolved";
import Declaration from "./Declaration";
import DocumentUpload from "./DocumentUpload";
import { FacilityOperator } from "./FacilityOperator";
import { BrowserRouter } from "react-router-dom";

const { formatProjectSummary } = exportForTesting;


const amsAuthTypes = ['AIR_EMISSIONS_DISCHARGE_PERMIT', 'EFFLUENT_DISCHARGE_PERMIT', 'REFUSE_DISCHARGE_PERMIT'];
const project = { project_lead_party_guid: "project_lead_party_guid" };
const formattedProjectSummary = formatProjectSummary(MOCK.PROJECT_SUMMARY, project, amsAuthTypes);

const mine_guid = formattedProjectSummary.mine_guid;
// this prevents console spam of "not wrapped in act()"
// by making the permits belong to the mine and therefore have it be loaded
const permits = MOCK.PERMITS.map((permit) => ({ ...permit, mine_guid }));

const initialState = {
    form: {
        [FORM.ADD_EDIT_PROJECT_SUMMARY]: {
            values: formattedProjectSummary,
        },
    },
    [PROJECTS]: {
        projectSummary: MOCK.PROJECT_SUMMARY,
        projects: MOCK.PROJECTS.records,
        project: MOCK.PROJECT,
    },
    [STATIC_CONTENT]: {
        projectSummaryAuthorizationTypes:
            MOCK.BULK_STATIC_CONTENT_RESPONSE.projectSummaryAuthorizationTypes,
    },
    [AUTHENTICATION]: {
        systemFlag: SystemFlagEnum.core,
        userAccessData: MOCK.USER_ACCESS_DATA,
        userInfo: { preferred_username: "USERNAME" }
    },
    [PERMITS]: {
        permits: permits
    }
};

const mockFields = jest.fn();
const mockDocFields = jest.fn();
const mockAuthFields = jest.fn();
const mockEnvFields = jest.fn();

jest.mock("@mds/common/components/projects/projectUtils", () => ({
    areFieldsDisabled: () => mockFields(),
    areDocumentFieldsDisabled: () => mockDocFields(),
    areAuthFieldsDisabled: () => mockAuthFields(),
    areAuthEnvFieldsDisabled: () => mockEnvFields(),
    getProjectStatusDescription: () => jest.fn().mockReturnValue("Status Description")
}));

const allowedEnabledWhenDisabled = [
    "status_code", // core user can edit status
    "project_lead_party_guid", // and the project lead
    "ADD_EDIT_PROJECT_SUMMARY_ams_terms_agreed", // still debating these 2, but harmless to leave open
    "ADD_EDIT_PROJECT_SUMMARY_confirmation_of_submission",
];

const allowedDisabledWhenEnabled = [
    "is_legal_address_same_as_mailing_address", // these 3 depend on the address and will change according to data
    "is_billing_address_same_as_mailing_address",
    "is_billing_address_same_as_legal_address",
];

const filterInputsByIds = (inputArray: NodeListOf<Element>, idArray: string[]): Element[] => {
    return Array.from(inputArray).filter((input) => !idArray.includes(input.id));
};

// checkboxes and radio is more reliable to use name
const getId = (input) => {
    const { id, name } = input;
    if (id && id !== "") { return id; }
    return name;
};

const isDocField = (id: string) => {
    return id.endsWith("documents");
}

// test if a field is an ENV field (and not a document field)
const isEnvMatch = (id: string) => {
    const match = amsAuthTypes.some((type) => id.includes(type));
    const isDoc = isDocField(id);
    return match && !isDoc;
};

describe("ProjectSummaryForm components disable accurately accoring to functions", () => {
    const renderedComponents = ({ fieldsDisabled, authFieldsDisabled, docFieldsDisabled, envFieldsDisabled }) => {
        mockFields.mockReturnValue(fieldsDisabled);
        mockDocFields.mockReturnValue(docFieldsDisabled);
        mockAuthFields.mockReturnValue(authFieldsDisabled);
        mockEnvFields.mockReturnValue(envFieldsDisabled);

        return <BrowserRouter>
            <FormWrapper name={FORM.ADD_EDIT_PROJECT_SUMMARY} onSubmit={jest.fn()}>
                <ProjectManagement />
                <BasicInformation fieldsDisabled={fieldsDisabled} />
                <LegalLandOwnerInformation fieldsDisabled={fieldsDisabled} />
                <ProjectLinks fieldsDisabled={fieldsDisabled} viewProject={jest.fn()} />
                <ProjectContacts fieldsDisabled={fieldsDisabled} />
                <ProjectDates fieldsDisabled={fieldsDisabled} />
                <Applicant fieldsDisabled={fieldsDisabled} />
                <Agent fieldsDisabled={fieldsDisabled} />
                <FacilityOperator fieldsDisabled={fieldsDisabled} />
                <AuthorizationsInvolved fieldsDisabled={authFieldsDisabled} />
                <DocumentUpload docFieldsDisabled={docFieldsDisabled} />
                <ApplicationSummary fieldsDisabled={fieldsDisabled} />
                <Declaration />
            </FormWrapper>
        </BrowserRouter>
    };

    test("shows all disabled", () => {
        const params = {
            fieldsDisabled: true,
            authFieldsDisabled: true,
            docFieldsDisabled: true,
            envFieldsDisabled: true
        };

        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                {renderedComponents(params)}
            </ReduxWrapper>
        );

        const enabledInputs = container.querySelectorAll(`input:not(:disabled)`);
        const filteredInputs = filterInputsByIds(enabledInputs, allowedEnabledWhenDisabled);
        const filteredIds = filteredInputs.map(getId);
        expect(filteredIds).toEqual([]);

        const enabledAuthDocuments = container.querySelectorAll(".authorization-documents-enabled");
        expect(enabledAuthDocuments.length).toBe(0);
    });

    test("shows all enabled", () => {
        const params = {
            fieldsDisabled: false,
            authFieldsDisabled: false,
            docFieldsDisabled: false,
            envFieldsDisabled: false
        };

        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                {renderedComponents(params)}
            </ReduxWrapper>
        );

        const disabledInputs = container.querySelectorAll(`input:disabled`);
        const filteredInputs = filterInputsByIds(disabledInputs, allowedDisabledWhenEnabled);
        const filteredIds = filteredInputs.map(getId);
        expect(filteredIds).toEqual([]);
    });

    test("can enable only document fields", async () => {
        const params = {
            fieldsDisabled: true,
            authFieldsDisabled: true,
            docFieldsDisabled: false,
            envFieldsDisabled: true
        };

        const { container, findAllByText } = render(
            <ReduxWrapper initialState={initialState}>
                {renderedComponents(params)}
            </ReduxWrapper>
        );

        const enabledInputs = container.querySelectorAll(`input:not(:disabled)`);
        const filteredEnabledInputs = filterInputsByIds(enabledInputs, allowedEnabledWhenDisabled);
        const filteredEnabledIds = filteredEnabledInputs.map(getId);

        filteredEnabledIds.forEach((id) => {
            expect(isDocField(id)).toBeTruthy();
        });

        const spatialUploadButtons = await findAllByText("Upload Spatial Data");
        expect(spatialUploadButtons.length).toBeGreaterThan(0);
        const disabledAuthDocuments = container.querySelectorAll(".authorization-documents-disabled");
        expect(disabledAuthDocuments.length).toBe(0);
    });

    test("can disable only env fields", () => {
        const params = {
            fieldsDisabled: false,
            authFieldsDisabled: false,
            docFieldsDisabled: false,
            envFieldsDisabled: true
        };

        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                {renderedComponents(params)}
            </ReduxWrapper>
        );

        // expect only ENV fields to be disabled
        const disabledInputs = container.querySelectorAll(`input:disabled`);
        const filteredDisabledInputs = filterInputsByIds(disabledInputs, allowedDisabledWhenEnabled);
        const filteredDisabledIds = filteredDisabledInputs.map(getId);

        const disabledNotEnv = filteredDisabledIds.filter((id) => !isEnvMatch(id));

        expect(disabledNotEnv).toEqual([]);

        // expect no ENV fields to be enabled, except documents
        const enabledInputs = container.querySelectorAll(`input:not(:disabled)`);
        const filteredEnabledInputs = filterInputsByIds(enabledInputs, allowedEnabledWhenDisabled);
        const filteredEnabledIds = filteredEnabledInputs.map(getId);

        const enabledEnv = filteredEnabledIds.filter(isEnvMatch);

        expect(enabledEnv).toEqual([]);
    });

    test("can disable all auth fields", () => {
        const params = {
            fieldsDisabled: false,
            authFieldsDisabled: true,
            docFieldsDisabled: false,
            envFieldsDisabled: true
        };

        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                {renderedComponents(params)}
            </ReduxWrapper>
        );

        // expect all the disabled fields to start with "authorization"
        const disabledInputs = container.querySelectorAll(`input:disabled`);
        const filteredDisabledInputs = filterInputsByIds(disabledInputs, allowedDisabledWhenEnabled);
        const filteredDisabledIds = filteredDisabledInputs.map(getId);

        const disabledNonAuthIds = filteredDisabledIds.filter((id) => !id.startsWith("authorization"));

        expect(disabledNonAuthIds).toEqual([]);

        // expect none of the enabled fields to start with "authorization"- except documents
        const enabledInputs = container.querySelectorAll(`input:not(:disabled)`);
        const filteredEnabledInputs = filterInputsByIds(enabledInputs, allowedEnabledWhenDisabled);
        const filteredEnabledIds = filteredEnabledInputs.map(getId);

        const enabledAuthIds = filteredEnabledIds.filter((id) => id.startsWith("authorization") && !isDocField(id));

        expect(enabledAuthIds).toEqual([]);
    });
});