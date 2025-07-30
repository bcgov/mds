import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, NOTICE_OF_WORK, PERMITS } from "@mds/common/constants/reducerTypes";
import NOWPermitGeneration from "./NOWPermitGeneration";
import { NOTICE_OF_WORK_APP_FORM } from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { USER_ROLES } from "@mds/common/constants/environment";

const categoryCodes = ["GEC", "HSC", "GOC", "ELC", "RCC"];
const amendment = MOCK.PERMITS[0].permit_amendments[0];
const mockPermit = {
    ...MOCK.PERMITS[0],
    permit_amendments: [
        {
            ...amendment,
            permit_amendment_status_code: "DFT",
            has_permit_conditions: true,
            now_application_guid: NOTICE_OF_WORK_APP_FORM.now_application_guid,
        }
    ]
}
const initialState = {
    [NOTICE_OF_WORK]: {
        noticeOfWork: NOTICE_OF_WORK_APP_FORM,
        applicationDelays: [],
    },
    [PERMITS]: {
        draftPermits: [
            mockPermit
        ],
        permits: [],
    },
    [AUTHENTICATION]: {
        userAccessData: [...MOCK.USER_ACCESS_DATA, USER_ROLES.role_edit_permits]
    }
};

describe("NOWPermitGeneration", () => {
    it("renders properly", () => {
        const { container } = render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <NOWPermitGeneration
                        noticeOfWork={NOTICE_OF_WORK_APP_FORM}
                        documentType={{
                            active_ind: true,
                            description: "Working Permit for Amendment",
                            now_application_document_sub_type_code: "AEF",
                            now_application_document_type_code: "PMA",
                            document_template: {
                                document_template_code: "PMA",
                                form_spec: []
                            }
                        }}
                        isViewMode={false}
                        fixedTop
                        isAmendment
                        isNoticeOfWorkTypeDisabled
                        handleGenerateDocumentFormSubmit={jest.fn()}
                        toggleEditMode={jest.fn()}
                        onPermitDraftSave={jest.fn()}

                    />
                </ReduxWrapper>
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    });
});