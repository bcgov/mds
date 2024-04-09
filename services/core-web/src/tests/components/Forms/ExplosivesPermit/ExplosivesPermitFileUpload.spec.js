import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { reduxForm } from "redux-form";
import { ExplosivesPermitFileUpload } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFileUpload";
import { store } from "@/App";
import { EXPLOSIVES_PERMIT_NEW } from "@/constants/forms";

const props = {};

const setupProps = () => {
  props.mineGuid = "6234612345";
  props.onFileLoad = jest.fn();
  props.onRemoveFile = jest.fn();
};

beforeEach(() => {
  setupProps();
});

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
