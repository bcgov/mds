import React from "react";
import { render } from "@testing-library/react";
import { AdministrativeTab } from "@/components/noticeOfWork/applications/administrative/AdministrativeTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import {
  AUTHENTICATION,
  NOTICE_OF_WORK,
  PARTIES,
  STATIC_CONTENT,
} from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import { BULK_STATIC_CONTENT_RESPONSE } from "@mds/common/tests/mocks/dataMocks";

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  },
  [PARTIES]: {
    inspectors: [],
    consultationAdvisors: [],
  },
  [STATIC_CONTENT]: {
    ...BULK_STATIC_CONTENT_RESPONSE,
    noticeOfWorkApplicationDocumentTypeOptions: [],
  },
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin],
  },
} as any;

const props = {
  fixedTop: false,
};

describe("AdministrativeTab", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <AdministrativeTab {...props} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
