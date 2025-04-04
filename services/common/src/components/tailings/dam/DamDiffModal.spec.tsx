import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { DAM_WITH_HISTORY } from "@mds/common/tests/mocks/dataMocks";
import { damReducerType } from "@mds/common/redux/slices/damSlice";
import DamDiffModal from "./DamDiffModal";
import moment from "moment";
import { DATETIME_TZ_FORMAT, DEFAULT_TIMEZONE } from "@mds/common/constants/strings";

jest.mock("@mds/common/redux/utils/helpers", () => {
    const helpers = jest.requireActual("@mds/common/redux/utils/helpers");
    return {
        ...helpers,
        formatDateTimeUserTz: jest.fn((dateTime) => moment(dateTime, true).isValid() && 
        moment.tz(dateTime, DEFAULT_TIMEZONE).format(DATETIME_TZ_FORMAT))
    }
  });

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