import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import { TAILINGS } from "@mds/common/constants/reducerTypes";
import TailingsSummaryPage from "./TailingsSummaryPage";


function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            tailingsStorageFacilityGuid: "e2629897-053e-4218-9299-479375e47f78",
            tab: "basic-information",
            mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
            userAction: "edit"
        }),
    };
}
jest.mock("react-router-dom", () => mockFunction());

const initialState = {
    [TAILINGS]: {
        tsf: TSF
    },
};

describe("Tailings TailingsSummaryPage", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <TailingsSummaryPage />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});