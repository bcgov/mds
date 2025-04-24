import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import DamsPage from "./DamsPage";
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
            damGuid: "",
            mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
            parentTSFFormMode: "edit",
            userAction: "newDam"
        }),
    };
}
jest.mock("react-router-dom", () => mockFunction());

describe("Tailings DamsPage", () => {
    it("renders properly", () => {
        const { container } = render(
            <BrowserRouter>
                <ReduxWrapper initialState={initialState}>
                    <DamsPage />
                </ReduxWrapper>
            </BrowserRouter>
        );
        expect(container).toMatchSnapshot();
    });
});