import React from "react";
import { render } from "@testing-library/react";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { TAILINGS } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINE_RESPONSE } from "@mds/common/tests/mocks/dataMocks";
import BasicInformation from "@mds/common/components/tailings/BasicInformation";
import { FORM } from "@mds/common/constants";
import TailingsProvider from "@common/components/tailings/TailingsProvider";
import { renderConfig } from "@/components/common/config";
import LinkButton from "@mds/common/components/common/LinkButton";
import ContactDetails from "@common/components/ContactDetails";
import Loading from "@/components/common/Loading";
import * as Routes from "@/constants/routes";
import { reduxForm } from "redux-form";
window.scrollTo = jest.fn();

const tsf = MINE_RESPONSE.mines[0].mine_tailings_storage_facilities[0];
const initialState = {
  [TAILINGS]: {
    tsf,
  },
};

const BasicInfoPageForm = reduxForm({ form: "TAILINGS" })(BasicInformation);
describe("BasicInformation", () => {
  test("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BasicInfoPageForm
          renderConfig={renderConfig}
          permits={[]}
          showUpdateTimestamp={true}
          tsf={tsf}
          canEditTSF={true}
          isEditMode={true}
        ></BasicInfoPageForm>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
