import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { DAM_WITH_HISTORY } from "@mds/common/tests/mocks/dataMocks";
import { damReducerType } from "@mds/common/redux/slices/damSlice";
import DamDiffModal from "./DamDiffModal";


const initialState = {
    [damReducerType]: {
        dams: {
            [DAM_WITH_HISTORY.dam_guid]: DAM_WITH_HISTORY
        }
    }
};

describe("Dam History Modal", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <DamDiffModal damGuid={DAM_WITH_HISTORY.dam_guid} />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});