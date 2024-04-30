import React from "react";
import { Variances } from "@/components/dashboard/mine/variances/Variances";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { STATIC_CONTENT, VARIANCES } from "@mds/common/constants/reducerTypes";

const initialState = {
  [VARIANCES]: { variances: MOCK.VARIANCES.records },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
};

const mine = MOCK.MINE_RESPONSE.mines[0];

describe("Variances", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <SidebarProvider value={{ mine } as any}>
          <Variances />
        </SidebarProvider>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();

    // const component = shallow(<Variances {...props} {...dispatchProps} />);
    // expect(component).toMatchSnapshot();
  });
});
