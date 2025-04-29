import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PARTY, TSF } from "@mds/common/tests/mocks/dataMocks";
import ContactDetails from "./ContactDetails";
import { tsfReducerType } from "@mds/common/redux/slices/tailingsSlice";


const initialState = {
    [tsfReducerType]: {
        mineTsfs: {
            [TSF.mine_guid]: [TSF]
        }
    },
};


describe("Tailings ContactDetails", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <ContactDetails contact={PARTY.parties[PARTY.partyIds[0]]} />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});