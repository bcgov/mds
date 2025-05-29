import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import EditTsfAppointmentForm, { AppointmentEditAction } from "./EditTsfAppointmentForm";


describe("EditTsfAppointmentForm", () => {
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper>
                <EditTsfAppointmentForm
                    partyAppointment={{ ...TSF.engineer_of_record, documents: [] }}
                    action={AppointmentEditAction.END}
                    tsfGuid={TSF.mine_tailings_storage_facility_guid}
                />
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});