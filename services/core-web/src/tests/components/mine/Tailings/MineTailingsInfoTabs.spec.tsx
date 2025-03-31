import React from "react";
import { MineTailingsInfoTabs } from "@/components/mine/Tailings/MineTailingsInfoTabs";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { AUTHENTICATION, REPORTS, STATIC_CONTENT, MINES } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { render } from "@testing-library/react";
import { USER_ROLES } from "@mds/common/constants/environment";
import { SystemFlagEnum } from "@mds/common/constants/enums";


const initialState: any = {
  [MINES]: MOCK.MINES,
  [REPORTS]: { mineReports: MOCK.MINE_REPORTS, reportsPageData: MOCK.PAGE_DATA },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [USER_ROLES.role_edit_tsf],
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());


describe("MineTailingsInfoTabs", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MineTailingsInfoTabs enabledTabs={["tsfDetails", "reports", "map", "tsf"]} />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
