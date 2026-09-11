import React from "react";
import { render, fireEvent, act, screen, waitFor } from "@testing-library/react";
import { DecisionPackageTab } from "@/components/mine/Projects/DecisionPackageTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

let capturedDocTableProps: any[] = [];
jest.mock("@mds/common/components/documents/DocumentTable", () => {
  const actual = jest.requireActual("@mds/common/components/documents/DocumentTable").default;
  return (props: any) => {
    capturedDocTableProps.push(props);
    return actual(props);
  };
});

let capturedStatusFormProps: any = null;
jest.mock("@/components/Forms/majorMineApplication/UpdateDecisionPackageStatusForm", () => {
  const actual = jest.requireActual(
    "@/components/Forms/majorMineApplication/UpdateDecisionPackageStatusForm"
  );
  const Component = actual.default || actual.UpdateDecisionPackageStatusForm || actual;
  return (props: any) => {
    capturedStatusFormProps = props;
    return <Component {...props} />;
  };
});

const sampleDocuments = [
  {
    mine_document_guid: "doc-guid-1",
    document_manager_guid: "doc-man-1",
    document_name: "DecisionDoc.pdf",
    upload_date: "2024-01-01",
    project_decision_package_document_type_code: "DCP",
  },
  {
    mine_document_guid: "doc-guid-2",
    document_manager_guid: "doc-man-2",
    document_name: "GovDoc.pdf",
    upload_date: "2024-01-02",
    project_decision_package_document_type_code: "ADG",
  },
  {
    mine_document_guid: "doc-guid-3",
    document_manager_guid: "doc-man-3",
    document_name: "InternalDoc.pdf",
    upload_date: "2024-01-03",
    project_decision_package_document_type_code: "INM",
  },
];

const mockProjectWithPackage = {
  ...MOCK.MAJOR_PROJECTS_DASHBOARD.records[0],
  mine_guid: "mine-guid-123",
  project_guid: "1234-4567-xwqy",
  project_decision_package: {
    project_decision_package_guid: "package-guid-123",
    status_code: "SUB",
    documents: sampleDocuments,
    update_user: "User",
    update_timestamp: "2024-01-01T00:00:00Z",
  },
};

const props = {
  project: MOCK.MAJOR_PROJECTS_DASHBOARD.records[0],
  match: { params: { projectGuid: "1234-4567-xwqy" } },
  projectDecisionPackageStatusCodesHash: MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH,
  fetchProjectById: jest.fn(() => Promise.resolve()),
  isFeatureEnabled: (feature: any) => true,
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      tab: "decision-package",
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

describe("DecisionPackageTab", () => {
  beforeEach(() => {
    capturedDocTableProps = [];
    capturedStatusFormProps = null;
    jest.clearAllMocks();
  });

  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <DecisionPackageTab {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("handles scroll events and toggles fixedTop state", () => {
    const { container } = render(
      <ReduxWrapper>
        <DecisionPackageTab {...props} />
      </ReduxWrapper>
    );

    act(() => {
      window.pageYOffset = 200;
      fireEvent.scroll(window);
    });
    expect(container.querySelector(".side-menu--fixed")).toBeInTheDocument();

    act(() => {
      window.pageYOffset = 50;
      fireEvent.scroll(window);
    });
    expect(container.querySelector(".side-menu")).toBeInTheDocument();
  });

  it("fetches project data and mine documents on mount when decision package exists", async () => {
    const fetchProjectById = jest.fn(() => Promise.resolve(mockProjectWithPackage));
    const fetchMineDocuments = jest.fn(() => Promise.resolve());

    render(
      <ReduxWrapper>
        <DecisionPackageTab
          {...props}
          fetchProjectById={fetchProjectById}
          fetchMineDocuments={fetchMineDocuments}
        />
      </ReduxWrapper>
    );

    await waitFor(() => {
      expect(fetchProjectById).toHaveBeenCalledWith("1234-4567-xwqy");
      expect(fetchMineDocuments).toHaveBeenCalledWith("mine-guid-123", {
        is_archived: true,
        project_decision_package_guid: "package-guid-123",
      });
    });
  });

  it("handles creating project decision package when package guid is absent", async () => {
    const createProjectDecisionPackage = jest.fn(() => Promise.resolve());
    const projectWithoutPackage = {
      ...MOCK.MAJOR_PROJECTS_DASHBOARD.records[0],
      project_guid: "proj-without-pkg",
      project_decision_package: {
        status_code: "NTS",
      },
    };

    render(
      <ReduxWrapper>
        <DecisionPackageTab
          {...props}
          project={projectWithoutPackage as any}
          createProjectDecisionPackage={createProjectDecisionPackage}
        />
      </ReduxWrapper>
    );

    expect(capturedStatusFormProps).toBeDefined();
    await act(async () => {
      await capturedStatusFormProps.onSubmit({ status_code: "INP" });
    });

    expect(createProjectDecisionPackage).toHaveBeenCalledWith(
      { projectGuid: "proj-without-pkg" },
      { status_code: "INP" }
    );
  });

  it("handles updating project decision package when package guid is present", async () => {
    const updateProjectDecisionPackage = jest.fn(() => Promise.resolve());

    render(
      <ReduxWrapper>
        <DecisionPackageTab
          {...props}
          project={mockProjectWithPackage as any}
          updateProjectDecisionPackage={updateProjectDecisionPackage}
        />
      </ReduxWrapper>
    );

    expect(capturedStatusFormProps).toBeDefined();
    await act(async () => {
      await capturedStatusFormProps.onSubmit({ status_code: "CMP" });
    });

    expect(updateProjectDecisionPackage).toHaveBeenCalledWith(
      {
        projectGuid: "1234-4567-xwqy",
        projectDecisionPackageGuid: "package-guid-123",
      },
      { status_code: "CMP" }
    );
  });

  it("handles DocumentTable removeDocument, onReplaceDocument, and onArchivedDocuments callbacks", async () => {
    const removeDocumentFromProjectDecisionPackage = jest.fn(() => Promise.resolve());
    const fetchProjectById = jest.fn(() => Promise.resolve(mockProjectWithPackage));

    render(
      <ReduxWrapper>
        <DecisionPackageTab
          {...props}
          project={mockProjectWithPackage as any}
          fetchProjectById={fetchProjectById}
          removeDocumentFromProjectDecisionPackage={removeDocumentFromProjectDecisionPackage}
        />
      </ReduxWrapper>
    );

    expect(capturedDocTableProps.length).toBeGreaterThan(0);
    const tableProps = capturedDocTableProps[0];

    // 1. removeDocument
    await act(async () => {
      await tableProps.removeDocument({ preventDefault: jest.fn() }, "doc-guid-1");
    });
    expect(removeDocumentFromProjectDecisionPackage).toHaveBeenCalledWith(
      "1234-4567-xwqy",
      "package-guid-123",
      "doc-guid-1"
    );

    // 2. onReplaceDocument
    fetchProjectById.mockClear();
    await act(async () => {
      await tableProps.onReplaceDocument();
    });
    expect(fetchProjectById).toHaveBeenCalledWith("1234-4567-xwqy");

    // 3. onArchivedDocuments
    fetchProjectById.mockClear();
    await act(async () => {
      await tableProps.onArchivedDocuments();
    });
    expect(fetchProjectById).toHaveBeenCalledWith("1234-4567-xwqy");
  });

  it("handles modal opening and submissions for upload-document (all document types)", async () => {
    const openModal = jest.fn();
    const updateProjectDecisionPackage = jest.fn(() => Promise.resolve());
    const closeModal = jest.fn();

    render(
      <ReduxWrapper>
        <DecisionPackageTab
          {...props}
          project={mockProjectWithPackage as any}
          openModal={openModal}
          closeModal={closeModal}
          updateProjectDecisionPackage={updateProjectDecisionPackage}
        />
      </ReduxWrapper>
    );

    // 1. Click Add Documents for upload-document
    const addButtons = screen.getAllByRole("button", { name: /\+ Add Documents/i });
    fireEvent.click(addButtons[0]);

    expect(openModal).toHaveBeenCalled();
    const modalArgs = openModal.mock.calls[0][0];
    expect(modalArgs.props.modalType).toBe("upload-document");

    const modalSubmit = modalArgs.props.onSubmit;

    // Test DCP branch
    await act(async () => {
      modalSubmit([{ document_name: "test.pdf" }], {
        isDecisionPackageEligible: true,
        addFilesToDecisionPackage: true,
      });
    });
    expect(updateProjectDecisionPackage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        documents: [
          expect.objectContaining({
            project_decision_package_document_type_code: "DCP",
          }),
        ],
      })
    );
    expect(closeModal).toHaveBeenCalled();

    // Test ADG branch
    updateProjectDecisionPackage.mockClear();
    await act(async () => {
      modalSubmit([{ document_name: "test2.pdf" }], {
        isDecisionPackageEligible: true,
        addFilesToDecisionPackage: false,
      });
    });
    expect(updateProjectDecisionPackage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        documents: [
          expect.objectContaining({
            project_decision_package_document_type_code: "ADG",
          }),
        ],
      })
    );

    // Test INM branch
    updateProjectDecisionPackage.mockClear();
    await act(async () => {
      modalSubmit([{ document_name: "test3.pdf" }], {
        isDecisionPackageEligible: false,
      });
    });
    expect(updateProjectDecisionPackage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        documents: [
          expect.objectContaining({
            project_decision_package_document_type_code: "INM",
          }),
        ],
      })
    );

    // Test (event, files, flags) signature
    updateProjectDecisionPackage.mockClear();
    await act(async () => {
      modalSubmit(null, [{ document_name: "test4.pdf" }], {
        isDecisionPackageEligible: true,
        addFilesToDecisionPackage: true,
      });
    });
    expect(updateProjectDecisionPackage).toHaveBeenCalled();
  });

  it("handles tab navigation to project-decision-package and renders archived documents", async () => {
    const fetchProjectById = jest.fn(() => Promise.resolve(mockProjectWithPackage));

    render(
      <ReduxWrapper>
        <DecisionPackageTab
          {...props}
          match={{ params: { projectGuid: "1234-4567-xwqy", tab: "project-decision-package" } }}
          mineDocuments={[
            {
              mine_document_guid: "archived-1",
              document_name: "Archived.pdf",
              upload_date: "2024-01-01",
            } as any,
          ]}
          fetchProjectById={fetchProjectById}
        />
      </ReduxWrapper>
    );

    await waitFor(() => {
      expect(fetchProjectById).toHaveBeenCalledWith("1234-4567-xwqy");
    });
  });

  it("handles modal opening for edit-decision-package and internal documents", async () => {
    const openModal = jest.fn();
    const closeModal = jest.fn();
    const updateProjectDecisionPackage = jest.fn(() => Promise.resolve());

    render(
      <ReduxWrapper>
        <DecisionPackageTab
          {...props}
          project={mockProjectWithPackage as any}
          openModal={openModal}
          closeModal={closeModal}
          updateProjectDecisionPackage={updateProjectDecisionPackage}
        />
      </ReduxWrapper>
    );

    // 1. Edit Package button
    const editButton = screen.getByRole("button", { name: /Edit Package/i });
    fireEvent.click(editButton);

    expect(openModal).toHaveBeenCalled();
    const editModalArgs = openModal.mock.calls[0][0];
    expect(editModalArgs.props.modalType).toBe("edit-decision-package");

    await act(async () => {
      await editModalArgs.props.onSubmit({ status_code: "CMP" });
    });
    expect(updateProjectDecisionPackage).toHaveBeenCalledWith(expect.anything(), {
      status_code: "CMP",
    });

    // 2. Add Documents for internal
    openModal.mockClear();
    const addButtons = screen.getAllByRole("button", { name: /\+ Add Documents/i });
    fireEvent.click(addButtons[1]);

    expect(openModal).toHaveBeenCalled();
    const internalModalArgs = openModal.mock.calls[0][0];
    expect(internalModalArgs.props.modalType).toBe("internal");
  });

  it("renders with default Redux state when optional props are omitted", () => {
    const { container } = render(
      <ReduxWrapper>
        <DecisionPackageTab />
      </ReduxWrapper>
    );
    expect(container).toBeInTheDocument();
  });
});
