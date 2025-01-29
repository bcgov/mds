import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINES, STATIC_CONTENT, PERMITS, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import ViewPermit from "./ViewPermit";
import { BrowserRouter } from "react-router-dom";
import { USER_ROLES } from "@mds/common/constants/environment";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import { userReducerType } from "@mds/common/redux/slices/userSlice";

import Routes from "@/routes/Routes";
import { VIEW_MINE_PERMIT_AMENDMENT } from "@/constants/routes";
const initialState = {
  [MINES]: MOCK.MINES,
  [userReducerType]: { user: MOCK.USERS[0] },
  [PERMITS]: { permits: MOCK.PERMITS, permitAmendments: { [MOCK.PERMITS[0].permit_guid]: MOCK.PERMITS[0].permit_amendments[0] } },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin, USER_ROLES.role_edit_template_conditions],
  },
};

const GENERATED_PERMIT = {
  ...MOCK.PERMITS[0],
  permit_amendments: MOCK.PERMITS[0].permit_amendments.map((pa) => ({ ...pa, is_generated_in_core: true }))
};

// permit was generated in Core
const generatedState = {
  ...initialState,
  [PERMITS]: { permits: [GENERATED_PERMIT], permitAmendments: { [GENERATED_PERMIT.permit_guid]: GENERATED_PERMIT.permit_amendments[0] } },
};

// permission to edit, not assigned to review
const unassignedState = {
  ...initialState,
  [userReducerType]: { user: MOCK.USERS[1] }
};

// no permission to edit, not assigned to review
const noPermissionState = {
  ...unassignedState,
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_view]
  }
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: MOCK.MINES.mineIds[0],
      permitGuid: MOCK.PERMITS[0].permit_guid,
      permitAmendmentGuid: MOCK.PERMITS[0].permit_amendments[0].permit_amendment_guid,
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

  it("does not allow any editing without the correct role", async () => {
    const { container, queryByText, queryByTitle } = render(
      <ReduxWrapper initialState={noPermissionState} >
        <BrowserRouter>
          <ViewPermit />
        </BrowserRouter>
      </ReduxWrapper>
    );
    // NO:
    // 1 add category button
    // 2 add condition button
    // 3 assign a reviewer
    // 4 click to edit condition
    // 5 click to edit category
    const AddCategoryButton = queryByText("+ Add Condition Category");
    expect(AddCategoryButton).not.toBeInTheDocument();
    const addConditionButton = queryByText("Add Condition");
    expect(addConditionButton).not.toBeInTheDocument();
    const assignReviewer = container.querySelectorAll('[data-cy="assigned_review_user"]')
    expect(Array.from(assignReviewer)).toEqual([]);
    const editCondition = queryByTitle("Edit Condition");
    expect(editCondition).not.toBeInTheDocument();
    const editCategory = queryByTitle("Click to edit");
    expect(editCategory).not.toBeInTheDocument();
  });

  it("only allows specific actions when permit has been generated in Core", async () => {
    const { container, getByText, queryByText, queryByTitle } = render(
      <ReduxWrapper initialState={generatedState} >
        <BrowserRouter>
          <ViewPermit />
        </BrowserRouter>
      </ReduxWrapper>
    );

    const banner = container.querySelector(".permit-status-banner");
    expect(banner).toBeInTheDocument();
    const bannerText = getByText("This permit was drafted and issued in Core; conditions cannot be modified.");
    expect(banner).toContainElement(bannerText);

    // YES:
    // 1 assign a reviewer
    // 2 click to edit condition
    // 3 add report requirement

    const assignReviewer = container.querySelectorAll('[data-cy="assigned_review_user"]')
    expect(Array.from(assignReviewer).length).toEqual(GENERATED_PERMIT.permit_amendments[0].condition_categories.length)
    const editCondition = queryByTitle("Edit Condition");
    expect(editCondition).toBeInTheDocument();

    editCondition.click();
    await waitFor(() => {
      const addReport = queryByText("Add Report Requirement");
      expect(addReport).toBeInTheDocument();
      // NO: list item, condition editor
      const addListItem = queryByText("List Item");
      expect(addListItem).not.toBeInTheDocument();
      const conditionInput = container.querySelector('[name="condition"]');
      expect(conditionInput).not.toBeInTheDocument();
    });

    // NO:
    // 1 add category button
    // 2 add condition button
    // 3 click to edit category
    // 4 edit any other fields beside report requirement
    const addCategoryButton = queryByText("+ Add Condition Category");
    expect(addCategoryButton).not.toBeInTheDocument();
    const addConditionButton = queryByText("Add Condition");
    expect(addConditionButton).not.toBeInTheDocument();
    const editCategory = queryByTitle("Click to edit");
    expect(editCategory).not.toBeInTheDocument();

  });

  it("does not allow editing without being assigned to the category", async () => {
    const { container, queryByText, queryByTitle } = render(
      <ReduxWrapper initialState={unassignedState} >
        <BrowserRouter>
          <ViewPermit />
        </BrowserRouter>
      </ReduxWrapper>
    );
    // NO:    
    // 1 add condition button
    // 2 click to edit condition
    // 3 click to edit category    
    const addConditionButton = queryByText("Add Condition");
    expect(addConditionButton).not.toBeInTheDocument();
    const editCondition = queryByTitle("Edit Condition");
    expect(editCondition).not.toBeInTheDocument();
    const editCategory = queryByTitle("Click to edit");
    expect(editCategory).not.toBeInTheDocument();

    // YES:
    // 1 add category button
    // 2 assign a reviewer
    const addCategoryButton = queryByText("+ Add Condition Category");
    expect(addCategoryButton).toBeInTheDocument();
    const assignReviewer = container.querySelectorAll('[data-cy="assigned_review_user"]')
    expect(Array.from(assignReviewer).length).toEqual(MOCK.PERMITS[0].permit_amendments[0].condition_categories.length)
  });

  it("enables adding a condition category in a modal", async () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState} >
        <BrowserRouter>
          <ModalWrapper />
          <ViewPermit />
        </BrowserRouter>
      </ReduxWrapper>
    );

    const banner = container.querySelector(".permit-status-banner");
    expect(banner).toBeInTheDocument();
    const bannerText = screen.getByText("Conditions and their report requirements have been extracted using AI and require review and verification.");
    expect(banner).toContainElement(bannerText);

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

    // allows editing of a condition
    const editCondition = screen.queryByTitle("Edit Condition");
    editCondition.click();
    await waitFor(() => {
      const addReport = screen.queryByText("Add Report Requirement");
      expect(addReport).toBeInTheDocument();
      const addListItem = screen.queryByText("List Item");
      expect(addListItem).toBeInTheDocument();
      const conditionInput = container.querySelector('[name="condition"]');
      expect(conditionInput).toBeInTheDocument();
    });

  });
});
