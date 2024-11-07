import React from "react";
import { render } from "@testing-library/react";
import FormWrapper from "../forms/FormWrapper";
import { FORM, SystemFlagEnum } from "@mds/common/constants";
import { ProjectManagement } from "./ProjectManagement";
import { LegalLandOwnerInformation } from "./LegalLandOwnerInformation";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { AUTHENTICATION, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { formatProjectSummary } from "@mds/common/redux/selectors/projectSelectors";
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

const amsAuthTypes = ['AIR_EMISSIONS_DISCHARGE_PERMIT', 'EFFLUENT_DISCHARGE_PERMIT', 'REFUSE_DISCHARGE_PERMIT'];
const project = { project_lead_party_guid: "project_lead_party_guid" };
const formattedProjectSummary = formatProjectSummary(MOCK.PROJECT_SUMMARY, project, amsAuthTypes);

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

const filterOutAllowedEnabledIds = (idArray: string[]) => {
    return idArray.filter((id) => !allowedEnabledWhenDisabled.includes(id));
};
describe("ProjectSummaryForm components disable accurately accoring to functions", () => {
    const renderedComponents = ({ fieldsDisabled, authFieldsDisabled, docFieldsDisabled, envFieldsDisabled }) => (
        <BrowserRouter>
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
    );

    test("shows all disabled", () => {
        const params = {
            fieldsDisabled: true,
            authFieldsDisabled: true,
            docFieldsDisabled: true,
            envFieldsDisabled: true
        };
        mockFields.mockReturnValue(params.fieldsDisabled);
        mockDocFields.mockReturnValue(params.docFieldsDisabled);
        mockAuthFields.mockReturnValue(params.authFieldsDisabled);
        mockEnvFields.mockReturnValue(params.envFieldsDisabled);

        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                {renderedComponents(params)}
            </ReduxWrapper>
        );

        const enabledInputs = container.querySelectorAll(`input:not(:disabled)`);
        const enabledInputIds = Array.from(enabledInputs).map((input) => input.id);
        const filteredIds = filterOutAllowedEnabledIds(enabledInputIds);
        expect(filteredIds).toEqual([]);
    });

    test("shows all enabled", () => {
        const params = {
            fieldsDisabled: false,
            authFieldsDisabled: false,
            docFieldsDisabled: false,
            envFieldsDisabled: false
        };
        mockFields.mockReturnValue(params.fieldsDisabled);
        mockDocFields.mockReturnValue(params.docFieldsDisabled);
        mockAuthFields.mockReturnValue(params.authFieldsDisabled);
        mockEnvFields.mockReturnValue(params.envFieldsDisabled);

        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                {renderedComponents(params)}
            </ReduxWrapper>
        );

        const disabledInputs = container.querySelectorAll(`input:disabled`);
        const disabledInputIds = Array.from(disabledInputs).map((input) => input.id);
        expect(disabledInputIds).toEqual([]);
    });
});