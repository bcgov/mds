import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import DamForm from "./DamForm";
import FormWrapper from "../../forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
import { BrowserRouter } from "react-router-dom";
import { tsfReducerType } from "@mds/common/redux/slices/tailingsSlice";


const initialState = {
    [tsfReducerType]: {
        mineTsfs: {
            [TSF.mine_guid]: [TSF]
        }
    },
};

function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            tailingsStorageFacilityGuid: "e2629897-053e-4218-9299-479375e47f78",
            mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
        }),
    };
}
jest.mock("react-router-dom", () => mockFunction());

describe("Tailings DamForm", () => {
    it("renders properly", () => {
        const { container } = render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <FormWrapper name={FORM.ADD_EDIT_DAM}>
                        <DamForm tsf={TSF} canEditTSF={true} isEditMode={true} canEditDam={true} />
                    </FormWrapper>
                </ReduxWrapper>
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    });
});