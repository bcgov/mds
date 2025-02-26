import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import { TAILINGS } from "@mds/common/constants/reducerTypes";
import QualifiedPerson from "./QualifiedPerson";
import FormWrapper from "../forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";


const initialState = {
    [TAILINGS]: {
        tsf: TSF
    },
};

describe("Tailings QualifiedPerson", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.ADD_TAILINGS_STORAGE_FACILITY}>
                    <QualifiedPerson mineGuid={"18133c75-49ad-4101-85f3-a43e35ae989a"} canEditTSF={true} isEditMode={true} />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});