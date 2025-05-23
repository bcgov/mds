import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { reduxForm } from "@mds/common/components/forms/form";
import { ExplosivesPermitFileUpload } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFileUpload";
import { store } from "@/App";
import { EXPLOSIVES_PERMIT_NEW } from "@/constants/forms";

const props = {
  mineGuid: "6234612345",
  onFileLoad: jest.fn(),
  onRemoveFile: jest.fn(),
};

describe("ExplosivesPermitFileUpload", () => {
  const FieldInForm = () => (
    <form>
      <ExplosivesPermitFileUpload {...props} />
    </form>
  );
  const ReduxForm = reduxForm({ form: EXPLOSIVES_PERMIT_NEW })(FieldInForm);
  it("renders properly", () => {
    const { container } = render(
      <Provider store={store}>
        <ReduxForm />
      </Provider>
    );
    expect(container.firstChild.firstChild).toMatchSnapshot();
  });
});
