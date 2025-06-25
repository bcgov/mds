import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import FormWrapper from "../../forms/FormWrapper";
import EnvDeclarationTab from "./EnvDeclarationTab";
import { FORM } from "@mds/common/constants/forms";

const initialState = {};


describe("EnvDeclarationTab", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.ADD_EDIT_AMS_FINAL_APPLICATION} initialValues={MOCK.AMS_FINAL_APPLICATION}>
                    <EnvDeclarationTab />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    })
});
