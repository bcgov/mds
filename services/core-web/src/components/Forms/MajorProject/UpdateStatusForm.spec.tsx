import React from "react";
import { render } from "@testing-library/react";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { FORM, PROJECT_STATUS_CODES, SystemFlagEnum } from "@mds/common/index";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import UpdateStatusForm from "./UpdateStatusForm";

const msState = {
    [AUTHENTICATION]: {
        systemFlag: SystemFlagEnum.ms
    }
};
const coreState = {
    [AUTHENTICATION]: {
        systemFlag: SystemFlagEnum.core
    }
};

describe("UpdateStatusForm", () => {
    it("renders properly", () => {
        const { container } = render(
            <>
                <ReduxWrapper initialState={msState}>
                    <p>MineSpace render: </p>
                    <UpdateStatusForm
                        displayValues={{
                            status_code: PROJECT_STATUS_CODES.ASG,
                            update_user: "username",
                            updateDate: "Jun 13 2022"
                        }}
                        handleSubmit={jest.fn()}
                        formName={FORM.UPDATE_IRT}
                        dropdownOptions={MOCK.INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_DROPDOWN}
                    />
                </ReduxWrapper>
                <ReduxWrapper initialState={coreState}>
                    <p>CORE render: </p>
                    <UpdateStatusForm
                        displayValues={{
                            status_code: PROJECT_STATUS_CODES.ASG,
                            update_user: "username",
                            updateDate: "Jun 13 2022"
                        }}
                        handleSubmit={jest.fn()}
                        formName={FORM.UPDATE_IRT}
                        dropdownOptions={MOCK.INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_DROPDOWN}
                    />
                </ReduxWrapper>
            </>
        );

        expect(container).toMatchSnapshot();
    });
});