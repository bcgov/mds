import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import PartyAppointmentTable from "./PartyAppointmentTable";
import FormWrapper from "../forms/FormWrapper";
import { FORM } from "@mds/common/constants/forms";
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
            tsfGuid: "e2629897-053e-4218-9299-479375e47f78",
            mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
        }),
    };
}
jest.mock("react-router-dom", () => mockFunction());

describe("Tailings PartyAppointmentTable", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <FormWrapper name={FORM.ADD_TAILINGS_STORAGE_FACILITY}>
                    <PartyAppointmentTable canEditTSF={true} />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});