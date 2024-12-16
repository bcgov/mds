import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINES, STATIC_CONTENT, PERMITS, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import ViewPermit from "./ViewPermit";
import { BrowserRouter } from "react-router-dom";
import { USER_ROLES } from "@mds/common/constants/environment";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";

const initialState = {
  [MINES]: MOCK.MINES,
  [PERMITS]: { permits: MOCK.PERMITS, permitAmendments: { [MOCK.PERMITS[0].permit_guid]: MOCK.PERMITS[0].permit_amendments[0] } },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin, USER_ROLES.role_edit_template_conditions],
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: MOCK.MINES.mineIds[0],
      permitGuid: MOCK.PERMITS[0].permit_guid,
      tab: "conditions",
    }),
    useLocation: jest.fn().mockReturnValue({
      hash: "",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());
describe("PermitConditions", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ViewPermit />
        </BrowserRouter>
      </ReduxWrapper>
    );


    expect(container).toMatchSnapshot();
  });

  it("enables adding a condition category in a modal", async () => {
    render(
      <ReduxWrapper initialState={initialState} >
        <BrowserRouter>
          <ModalWrapper />
          <ViewPermit />
        </BrowserRouter>
      </ReduxWrapper>
    );


    const addConditionLink = screen.getByText("+ Add Condition Category");
    expect(addConditionLink).toBeInTheDocument();
    addConditionLink.click();

    let descriptionInput;
    await waitFor(() => {
      descriptionInput = screen.getByRole("combobox", { "name": "description" });
      expect(descriptionInput).toBeInTheDocument();
    })


    const stepInput = screen.getByRole("textbox", { "name": "step" });
    expect(stepInput).toBeInTheDocument();

    const AddCategoryButton = screen.getByText("Add Category");
    expect(AddCategoryButton).toBeInTheDocument();

    AddCategoryButton.click();

    await waitFor(() => { expect(screen.getAllByText("This is a required field")).toHaveLength(2); })

    fireEvent.mouseDown(descriptionInput);

    fireEvent.change(descriptionInput, { target: { value: "New Condition Description" } });

    screen.getAllByText('New Condition Description')[1].click();
    expect(descriptionInput).toHaveValue("New Condition Description");

    fireEvent.change(stepInput, { target: { value: "1" } });

    AddCategoryButton.click();

    await waitFor(() => {
      expect(screen.queryByText("Add Category")).not.toBeInTheDocument();
    });
  });
});
