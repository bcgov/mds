import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PERMITS } from "@mds/common/constants/reducerTypes";
import * as permitActionCreator from "@mds/common/redux/actionCreators/permitActionCreator";
import ViewPermitRedirect from "@/components/mine/Permit/ViewPermitRedirect";
import { VIEW_MINE_PERMIT, VIEW_MINE_PERMIT_AMENDMENT } from "@/constants/routes";

jest.mock("@mds/common/redux/actionCreators/permitActionCreator");

const mockState = {
    [PERMITS]: {
        permits: [MOCK.PERMITS[0]]

    }
};

describe("ViewPermitRedirect", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects to amendment view when permit exists", async () => {
        const fetchPermitsSpy = jest.spyOn(permitActionCreator, "fetchPermits").mockImplementation(() => () => Promise.resolve());
        render(
            <ReduxWrapper initialState={mockState}>
                <MemoryRouter initialEntries={[VIEW_MINE_PERMIT.dynamicRoute(MOCK.PERMITS[0].mine_guid, MOCK.PERMITS[0].permit_guid, "summary")]}>
                    <Route path={VIEW_MINE_PERMIT.route}>
                        <ViewPermitRedirect />
                    </Route>
                    <Route path={VIEW_MINE_PERMIT_AMENDMENT.route}>
                        <div>Amendment View</div>
                    </Route>
                </MemoryRouter>
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText("Amendment View")).toBeInTheDocument();
            // Verify that fetchPermits was not called if permit is already in store
            expect(fetchPermitsSpy).not.toHaveBeenCalledWith(MOCK.PERMITS[0].mine_guid);
        })

    });

    it("renders empty fragment when permit is not found", () => {
        const fetchPermitsSpy = jest.spyOn(permitActionCreator, "fetchPermits").mockImplementation(() => () => Promise.resolve());

        const { container } = render(
            <ReduxWrapper initialState={{}}>
                <MemoryRouter initialEntries={[VIEW_MINE_PERMIT.dynamicRoute(MOCK.PERMITS[0].mine_guid, MOCK.PERMITS[0].permit_guid, "summary")]}>
                    <Route path={VIEW_MINE_PERMIT.route}>
                        <ViewPermitRedirect />
                    </Route>
                    <Route path={VIEW_MINE_PERMIT_AMENDMENT.route}>
                        <div>Amendment View</div>
                    </Route>
                </MemoryRouter>
            </ReduxWrapper>
        );

        expect(container.firstChild).toBeNull();

        // Verify that fetchPermits was called when permit is not in store
        expect(fetchPermitsSpy).toHaveBeenCalledWith(MOCK.PERMITS[0].mine_guid);
    });
});