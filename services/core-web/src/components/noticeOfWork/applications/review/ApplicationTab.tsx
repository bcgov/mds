import React, { FC, useState, useRef } from "react";
import { Prompt, useLocation } from "react-router-dom";
import { Button, Dropdown, Menu, Popconfirm, Alert, Divider } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { getFormValues, reset, getFormSyncErrors, submit, hasSubmitFailed } from "@mds/common/components/forms/form";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { get, isNull, isUndefined } from "lodash";
import {
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { getDropdownInspectors } from "@mds/common/redux/slices/partiesSlice";
import {
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNOWReclamationSummary,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  getGeneratableNoticeOfWorkApplicationDocumentTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { flattenObject } from "@common/utils/helpers";
import { downloadNowDocument } from "@mds/common/redux/utils/actionlessNetworkCalls";
import * as Strings from "@mds/common/constants/strings";
import * as Permission from "@/constants/permissions";
import { exportNoticeOfWorkApplicationDocument } from "@/actionCreators/documentActionCreator";
import ReviewNOWApplication from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import * as FORM from "@/constants/forms";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import AssignInspectors from "@/components/noticeOfWork/applications/verification/AssignInspectors";
import AssignTier from "@/components/noticeOfWork/applications/verification/AssignTier";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import ReviewAdminAmendmentApplication from "@/components/noticeOfWork/applications/review/ReviewAdminAmendmentApplication";
import { EDIT_OUTLINE } from "@/constants/assets";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import { INoticeOfWorkApplication } from "@mds/common/src/interfaces/noticeOfWorkApplication.interface";

export interface ApplicationTabProps {
  fixedTop: boolean;
  isNoticeOfWorkTypeDisabled?: boolean;
  showActionsAndProgress?: boolean;
}

export const ApplicationTab: FC<ApplicationTabProps> = ({
  fixedTop,
  isNoticeOfWorkTypeDisabled = true,
  showActionsAndProgress = true,
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isFeatureEnabled } = useFeatureFlag();

  const [isInspectorsLoaded, setIsInspectorsLoaded] = useState(true);
  const [isViewMode, setIsViewMode] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [exportingNow, setExportingNow] = useState(false);

  const count = useRef(1);

  const noticeOfWork = useAppSelector(getNoticeOfWork);
  const originalNoticeOfWork = useAppSelector(getOriginalNoticeOfWork);
  const importNowSubmissionDocumentsJob = useAppSelector(getImportNowSubmissionDocumentsJob);
  const formValues: Partial<INoticeOfWorkApplication> = useAppSelector(getFormValues(FORM.EDIT_NOTICE_OF_WORK));
  const formErrors = useAppSelector(getFormSyncErrors(FORM.EDIT_NOTICE_OF_WORK));
  const submitFailed = useAppSelector(hasSubmitFailed(FORM.EDIT_NOTICE_OF_WORK));
  const inspectors = useAppSelector(getDropdownInspectors);
  const reclamationSummary = useAppSelector(getNOWReclamationSummary);
  const generatableApplicationDocuments = useAppSelector(getGeneratableNoticeOfWorkApplicationDocumentTypeOptions);

  const toggleEditMode = () => {
    setIsViewMode((prev) => !prev);
    setMenuVisible(false);
  };

  const handleMenuClick = () => {
    setMenuVisible(false);
  };

  const exportNowDocument = (documentType: any) => {
    const documentTypeCode = documentType.now_application_document_type_code;
    const payload = {
      now_application_guid: noticeOfWork.now_application_guid,
    };
    return dispatch(
      exportNoticeOfWorkApplicationDocument(
        documentTypeCode,
        payload,
        `Successfully exported ${documentType.description} for this Notice of Work`
      )
    );
  };

  const focusErrorInput = (skip = false) => {
    dispatch(submit(FORM.EDIT_NOTICE_OF_WORK));
    const errors = Object.keys(flattenObject(formErrors || {}));
    if (skip) {
      if (count.current < errors.length) {
        count.current += 1;
      } else if (count.current === errors.length) {
        count.current = 1;
      }
    }
    const errorElement = document.querySelector(`[name="${errors[count.current - 1]}"]`) as HTMLElement;
    if (errorElement && errorElement.focus) {
      errorElement.focus();
    }
  };

  const handleSaveNOWEdit = (endEditSession: boolean) => {
    setSubmitted(true);
    const errors = Object.keys(flattenObject(formErrors || {}));
    if (errors.length > 0) {
      focusErrorInput();
    } else {
      setSubmitting(true);
      return dispatch(
        updateNoticeOfWorkApplication(
          formValues,
          noticeOfWork.now_application_guid
        )
      )
        .then(() => {
          dispatch(fetchImportedNoticeOfWorkApplication(noticeOfWork.now_application_guid)).then(() => {
            setIsViewMode(endEditSession);
            setSubmitted(false);
          });
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  const handleExportNowDocument = (documentTypeCode: string) => {
    const documentType = generatableApplicationDocuments[documentTypeCode];
    setExportingNow(true);
    return exportNowDocument(documentType)
      .then(() => {
        dispatch(fetchImportedNoticeOfWorkApplication(noticeOfWork.now_application_guid));
      })
      .finally(() => setExportingNow(false));
  };

  const handleVisibleChange = (flag: boolean) => {
    setMenuVisible(flag);
  };

  const showApplicationForm = () => {
    const document = noticeOfWork.submission_documents.filter(
      (x: any) => x.filename === "ApplicationForm.pdf"
    )[0];
    if (document) {
      downloadNowDocument(
        document.id,
        noticeOfWork.now_application_guid,
        document.filename
      );
    }
  };

  const menu = () => {
    const isImported = noticeOfWork.imported_to_core;
    return (
      <Menu>
        <>
          {isImported &&
            noticeOfWork.submission_documents &&
            noticeOfWork.submission_documents.filter(
              (x: any) => x.filename === "ApplicationForm.pdf"
            ).length > 0 && (
              <Menu.Item
                key="open-original-application-form"
                className="custom-menu-item"
                onClick={showApplicationForm}
              >
                Original Application
              </Menu.Item>
            )}
        </>
        <>
          {Object.values(generatableApplicationDocuments)
            .filter(
              ({ now_application_document_type_code }: any) =>
                now_application_document_type_code === "NTR"
            )
            .map((document: any) => {
              return (
                <Menu.Item
                  key={document.now_application_document_type_code}
                  className="custom-menu-item"
                  onClick={() =>
                    handleExportNowDocument(document.now_application_document_type_code)
                  }
                  disabled={exportingNow}
                >
                  Edited Application
                </Menu.Item>
              );
            })}
        </>
      </Menu>
    );
  };

  const handleCancelNOWEdit = () => {
    dispatch(reset(FORM.EDIT_NOTICE_OF_WORK));
    setIsViewMode(true);
  };

  const renderEditModeNav = () => {
    const errorsLength = Object.keys(flattenObject(formErrors || {})).length;
    const showErrors = errorsLength > 0 && submitted && submitFailed;
    const isNoWApplication = noticeOfWork.application_type_code === "NOW";
    return (
      <NOWTabHeader
        showProgressButton={!!noticeOfWork.lead_inspector_party_guid && isNoWApplication}
        tab="REV"
        showActionsAndProgress={showActionsAndProgress}
        tabActions={
          noticeOfWork.lead_inspector_party_guid && (
            <>
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="REV">
                <Button className="form-btn" onClick={toggleEditMode}>
                  <img alt="EDIT_OUTLINE" className="padding-sm--right" src={EDIT_OUTLINE} />
                  Edit
                </Button>
              </NOWActionWrapper>
              {isNoWApplication && (
                <Dropdown
                  overlay={menu()}
                  placement="bottomLeft"
                  onVisibleChange={handleVisibleChange}
                  visible={menuVisible}
                >
                  <Button className="full-mobile">
                    Download
                    <DownOutlined />
                  </Button>
                </Dropdown>
              )}
            </>
          )
        }
        tabEditActions={
          <div className="center">
            <Popconfirm
              placement="bottomRight"
              title="You have unsaved changes. Are you sure you want to cancel?"
              onConfirm={handleCancelNOWEdit}
              okText="Yes"
              cancelText="No"
              disabled={submitting}
            >
              <Button className="full-mobile" disabled={submitting}>
                Cancel
              </Button>
            </Popconfirm>
            {showErrors && (
              <Button
                className="full-mobile"
                onClick={() => focusErrorInput(true)}
              >
                Next Issue
              </Button>
            )}
            <Button
              className="full-mobile"
              onClick={() => handleSaveNOWEdit(false)}
              loading={submitting}
            >
              Save & Continue
            </Button>
            <Button
              type="primary"
              className="full-mobile"
              onClick={() => handleSaveNOWEdit(true)}
              loading={submitting}
            >
              Save
            </Button>
            {showErrors && (
              <Alert
                message={`You have ${errorsLength} ${errorsLength === 1 ? "issue" : "issues"
                  } that must be fixed before proceeding.`}
                type="error"
                showIcon
              />
            )}
          </div>
        }
        tabName="Application"
        fixedTop={fixedTop}
        noticeOfWork={noticeOfWork}
        isEditMode={!isViewMode}
      />
    );
  };

  const renderOriginalValues = (path: string, currentPath: string | null = null) => {
    const prevValue = get(originalNoticeOfWork, path);
    const currentValue = get(noticeOfWork, currentPath || path);
    
    const isNewValue = isUndefined(prevValue) && !isNull(currentValue);
    const isPrevValue = !isUndefined(prevValue) && !isNull(prevValue);
    const hasBeenEdited = isNewValue || isPrevValue;
    const edited = hasBeenEdited && prevValue !== currentValue;
    const getValue = () => {
      if (prevValue === true) {
        return "Yes";
      }
      if (prevValue === false) {
        return "No";
      }
      if (isUndefined(prevValue) || isNull(prevValue)) {
        return Strings.EMPTY_FIELD;
      }
      return prevValue;
    };

    return { value: getValue(), edited };
  };

  const handleUpdateInspectors = (values: any, callback?: () => void) => {
    setIsInspectorsLoaded(false);
    return dispatch(
      updateNoticeOfWorkApplication(
        values,
        noticeOfWork.now_application_guid,
        "Successfully updated the assigned inspectors"
      )
    ).then(() => {
      dispatch(fetchImportedNoticeOfWorkApplication(noticeOfWork.now_application_guid)).then(() => {
        setIsInspectorsLoaded(true);
        if (callback) {
          callback();
        }
      });
    });
  };

  const handleUpdateTier = (values: any, callback?: () => void) => {
    setIsInspectorsLoaded(false);
    return dispatch(
      updateNoticeOfWorkApplication(
        values,
        noticeOfWork.now_application_guid,
        "Successfully updated the Tier Category"
      )
    ).then(() => {
      dispatch(fetchImportedNoticeOfWorkApplication(noticeOfWork.now_application_guid)).then(() => {
        setIsInspectorsLoaded(true);
        if (callback) {
          callback();
        }
      });
    });
  };

  const isImported = noticeOfWork?.imported_to_core;
  const isNoWApplication = noticeOfWork?.application_type_code === "NOW";

  return (
    <React.Fragment>
      <Prompt
        // @ts-ignore
        style={{ backgroundColor: "red !important" }}
        when={!isViewMode}
        message={(nextLocation: any, action: any) => {
          const onTechnicalReview =
            nextLocation.pathname.includes("application") &&
            location.pathname.includes("application");
          // handle user navigating away from technical review/draft permit while in editMode
          if (action === "REPLACE" && !onTechnicalReview) {
            handleCancelNOWEdit();
          }
          // if the pathname changes while still on the technicalReview tab (via side navigation), don't prompt user
          return location.pathname === nextLocation.pathname && onTechnicalReview
            ? true
            : "You have unsaved changes. Are you sure you want to leave without saving?";
        }}
      />
      {renderEditModeNav()}
      <div className={fixedTop ? "side-menu--fixed" : "side-menu"}>
        <NOWSideMenu tabSection="application" />
      </div>
      <div className={fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"}>
        {isImported && !noticeOfWork.lead_inspector_party_guid && (
          <>
            <ScrollContentWrapper id="inspectors" title="Assign Inspectors" isActive>
              <AssignInspectors
                inspectors={inspectors}
                noticeOfWork={noticeOfWork}
                handleUpdateInspectors={handleUpdateInspectors}
                title="Assign Inspectors"
                isEditMode
                isLoaded={isInspectorsLoaded}
              />
            </ScrollContentWrapper>
            {isFeatureEnabled(Feature.NOTICE_OF_WORK_TIER) && (
              <ScrollContentWrapper id="tier-category" title="Assign Tier Category" isActive>
                <AssignTier
                  noticeOfWork={noticeOfWork}
                  handleUpdateTier={handleUpdateTier}
                  title="Assign Tier Category"
                  isEditMode
                  isLoaded={isInspectorsLoaded}
                />
              </ScrollContentWrapper>
            )}
            <Divider />
          </>
        )}
        {isNoWApplication ? (
          <ReviewNOWApplication
            reclamationSummary={reclamationSummary}
            isViewMode={isViewMode}
            noticeOfWorkType={noticeOfWork.notice_of_work_type_code}
            initialValues={noticeOfWork}
            noticeOfWork={noticeOfWork}
            importNowSubmissionDocumentsJob={importNowSubmissionDocumentsJob}
            renderOriginalValues={renderOriginalValues}
            isPreLaunch={originalNoticeOfWork?.is_pre_launch}
            isNoticeOfWorkTypeDisabled={isNoticeOfWorkTypeDisabled}
          />
        ) : (
          <ReviewAdminAmendmentApplication
            reclamationSummary={reclamationSummary}
            isViewMode={isViewMode}
            noticeOfWorkType={noticeOfWork.notice_of_work_type_code}
            initialValues={noticeOfWork}
            noticeOfWork={noticeOfWork}
            renderOriginalValues={renderOriginalValues}
            isPreLaunch={originalNoticeOfWork?.is_pre_launch}
            isNoticeOfWorkTypeDisabled={isNoticeOfWorkTypeDisabled}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default ApplicationTab;
