import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import AssociatedDams from "./AssociatedDams";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import { TAILINGS } from "@mds/common/constants/reducerTypes";

const initialState = {
    [TAILINGS]: {
        tsf: TSF
    },
};

describe("Tailings Associated Dams", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <AssociatedDams canEditTSF={true} isEditMode={true} />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot()
    });
})