import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import MineUserAccessPage from "./MineUserAccessPage";
import { minespaceReducerType } from "@mds/common/redux/slices/minespaceSlice";
import { MINESPACE_USERS } from "@mds/common/tests/mocks/dataMocks";

function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            id: "fc72863d-83e8-46ba-90f9-87b0ed78823f",
        }),
    };
}
jest.mock("react-router-dom", () => mockFunction());


const mineGuid = "fc72863d-83e8-46ba-90f9-87b0ed78823f";

const initialState = {
    [minespaceReducerType]: {
        minespaceUsersByMine: {
            [mineGuid]: MINESPACE_USERS.filter((u) => u.mines.includes(mineGuid))
        }
    }
};

describe("MineUserAccessPage - core", () => {
    it("renders properly", async () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <MineUserAccessPage />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});