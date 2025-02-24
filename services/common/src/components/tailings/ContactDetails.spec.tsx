import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PARTY, TSF } from "@mds/common/tests/mocks/dataMocks";
import { TAILINGS } from "@mds/common/constants/reducerTypes";
import ContactDetails from "./ContactDetails";


const initialState = {
    [TAILINGS]: {
        tsf: TSF
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