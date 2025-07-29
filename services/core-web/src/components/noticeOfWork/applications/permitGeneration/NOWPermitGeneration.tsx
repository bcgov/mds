import React, { FC, useEffect, useState } from "react";
import moment from "moment";
import { isEmpty } from "lodash";
import { Button, Popconfirm } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { formatDate, getDurationText, flattenObject, formatDateUTC } from "@mds/common/redux/utils/helpers";
import { getFormValues, reset, isSubmitting, getFormSyncErrors, submit } from "@mds/common/components/forms/form";
import {
  getNoticeOfWorkApplicationTypeOptions,
  getDropdownPermitAmendmentTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  fetchPermits,
  updatePermitAmendment,
  fetchDraftPermitByNOW,
  deletePermit,
  deletePermitAmendment,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { storeEditingPreambleFlag } from "@mds/common/redux/actions/permitActions";
import {
  getDraftPermitForNOW,
  getDraftPermitAmendmentForNOW,
  getPermits,
} from "@mds/common/redux/selectors/permitSelectors";
import { PERMIT_AMENDMENT_TYPES } from "@mds/common/constants/strings";
import { getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import * as FORM from "@/constants/forms";
import * as Permission from "@/constants/permissions";
import GeneratePermitForm from "@/components/Forms/permits/GeneratePermitForm";
import { EDIT_OUTLINE } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { INoWApplicationForm, INoWDocumentType, INoWGeneratedPermit, IPermit, IPermitAmendment } from "@mds/common/interfaces";
import DeleteDraftPermitModal from "@/components/modalContent/DeleteDraftPermitModal";

/**
 * @const NOWPermitGeneration - contains the form and information to generate a permit document form a Notice of Work
 */
const regionHash = {
  SE: "Cranbrook",
  SC: "Kamloops",
  NE: "Prince George",
  NW: "Smithers",
  SW: "Victoria",
};

const getDocumentsMetadataInitialValues = (documents, guid_name) => {
  const initialValues = {};
  !isEmpty(documents) &&
    documents.forEach((doc) => {
      initialValues[`${doc[guid_name]}_preamble_title`] = doc.preamble_title;
      initialValues[`${doc[guid_name]}_preamble_author`] = doc.preamble_author;
      initialValues[`${doc[guid_name]}_preamble_date`] = doc.preamble_date;
    });
  return initialValues;
};

const getDocumentInfo = (doc) => {
  const title = doc.preamble_title || "<DOCUMENT TITLE MISSING!>";
  const author = doc.preamble_author;
  const date = doc.preamble_date;
  let info = `${title}, `;
  info += date ? `dated ${formatDate(date)}` : "not dated";
  info += author ? `, prepared by ${author}` : "";
  return info;
};

interface NOWPermitGenerationProps {
  noticeOfWork: INoWApplicationForm;
  handleGenerateDocumentFormSubmit: (documentType, values) => Promise<void>;
  documentType: INoWDocumentType;
  toggleEditMode: () => void;
  isViewMode: boolean;
  fixedTop: boolean;
  isAmendment: boolean;
  onPermitDraftSave: () => Promise<void>;
  isNoticeOfWorkTypeDisabled?: boolean;
}

export const NOWPermitGeneration: FC<NOWPermitGenerationProps> = ({
  noticeOfWork,
  handleGenerateDocumentFormSubmit,
  documentType,
  toggleEditMode,
  isViewMode,
  fixedTop,
  isAmendment,
  onPermitDraftSave,
  isNoticeOfWorkTypeDisabled = true,
}) => {
  const dispatch = useAppDispatch();
  const appOptions = useAppSelector(getNoticeOfWorkApplicationTypeOptions);
  const formValues = useAppSelector(getFormValues(FORM.GENERATE_PERMIT)) as INoWGeneratedPermit;
  const submitting = useAppSelector(isSubmitting(FORM.GENERATE_PERMIT));
  const draftPermit = useAppSelector(getDraftPermitForNOW) as IPermit;
  const draftPermitAmendment = useAppSelector(getDraftPermitAmendmentForNOW) as IPermitAmendment;
  const formErrors = useAppSelector(getFormSyncErrors(FORM.GENERATE_PERMIT));
  const permitAmendmentTypeDropDownOptions = useAppSelector(getDropdownPermitAmendmentTypeOptions);
  const permits = useAppSelector(getPermits);
  const progress = useAppSelector(getNOWProgress);

  const [permitGenObj, setPermitGenObj] = useState<INoWGeneratedPermit>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [permittee, setPermittee] = useState({});
  const [permitAmendmentDropdown, setPermitAmendmentDropdown] = useState([]);
  const [isPermitAmendmentTypeDropDownDisabled, setIsPermitAmendmentTypeDropDownDisabled] = useState(true);
  const [downloadingDraft, setDownloadingDraft] = useState(false);

  const createPermitGenObject = () => {
    let OGPIssueDate = null;
    if (draftPermit.permit_status_code) {
      OGPIssueDate = draftPermit.permit_status_code === "D"
        ? formatDate(draftPermitAmendment.issue_date)
        : formatDate(
          draftPermit.permit_amendments.filter((a) => a.permit_amendment_type_code === "OGP")
            .map((a) => a.issue_date)[0]
        );
    }

    const newPermitGenObj: INoWGeneratedPermit = {
      permit_number: "",
      // @ts-ignore: types just don't get followed in NoW. formatted_original_issue_date
      formatted_original_issue_date: OGPIssueDate,
      formatted_issue_date: formatDate(draftPermitAmendment.issue_date),
      issue_date: draftPermitAmendment.issue_date,
      formatted_auth_end_date: formatDate(draftPermitAmendment.authorization_end_date),
      auth_end_date: draftPermitAmendment.authorization_end_date,
      regional_office: regionHash[noticeOfWork.mine_region],
      current_date: moment().format("Do"),
      current_month: moment().format("MMMM"),
      current_year: moment().format("YYYY"),
      conditions: "",
      issuing_inspector_title: "Inspector of Mines",
      application_last_updated_date: noticeOfWork.last_updated_date
        ? formatDateUTC(noticeOfWork.last_updated_date)
        : formatDate(noticeOfWork.submitted_date),
      proposed_start_date: noticeOfWork.proposed_start_date,
      proposed_end_date: noticeOfWork.proposed_end_date,
      proposed_term_of_authorization: getDurationText(
        noticeOfWork.proposed_start_date,
        noticeOfWork.proposed_end_date
      ),
      term_of_authorization:
        draftPermitAmendment.issue_date && draftPermitAmendment.authorization_end_date
          ? getDurationText(draftPermitAmendment.issue_date, draftPermitAmendment.authorization_end_date)
          : "N/A",
      preamble_text: draftPermitAmendment.preamble_text,
      mine_no: noticeOfWork.mine_no,
    }
    const permitPermittee = noticeOfWork.contacts.filter((c) => c.mine_party_appt_type_code_description === "Permittee")[0];
    const originalAmendment = draftPermit.permit_amendments.filter(
      (org) => org.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.original
    )[0];
    const addressLineOne =
      !isEmpty(permitPermittee) &&
        !isEmpty(permitPermittee.party.address[0]) &&
        permitPermittee.party.address[0].address_line_1
        ? `${permitPermittee.party.address[0].address_line_1}\n`
        : "";
    const addressLineTwo =
      !isEmpty(permitPermittee) && !isEmpty(permitPermittee.party.address[0])
        ? `${permitPermittee.party.address[0].city || ""} ${permitPermittee.party.address[0]
          .sub_division_code || ""} ${permitPermittee.party.address[0].post_code || ""}`
        : "";
    const mailingAddress = `${addressLineOne}${addressLineTwo}`;
    newPermitGenObj.permittee = !isEmpty(permitPermittee) ? permitPermittee.party.name : "";
    newPermitGenObj.permittee_email = !isEmpty(permitPermittee) ? permitPermittee.party.email : "";
    newPermitGenObj.permittee_mailing_address = mailingAddress;
    newPermitGenObj.property = noticeOfWork.property_name;
    newPermitGenObj.mine_location = `Latitude: ${noticeOfWork.latitude}, Longitude: ${noticeOfWork.longitude}`;
    newPermitGenObj.application_date = noticeOfWork.submitted_date;
    newPermitGenObj.permit_number = draftPermit.permit_no;
    newPermitGenObj.original_permit_issue_date = isEmpty(originalAmendment)
      ? ""
      : originalAmendment.issue_date;
    newPermitGenObj.application_type = appOptions?.filter(
      (option) => option.notice_of_work_type_code === noticeOfWork.notice_of_work_type_code
    )[0].description;
    newPermitGenObj.lead_inspector = noticeOfWork.lead_inspector.name;
    newPermitGenObj.regional_office = !draftPermitAmendment.regional_office
      ? regionHash[noticeOfWork.mine_region]
      : draftPermitAmendment.regional_office;
    newPermitGenObj.now_tracking_number = noticeOfWork.now_tracking_number;
    newPermitGenObj.now_number = noticeOfWork.now_number;

    newPermitGenObj.site_property = noticeOfWork.site_property
      ? noticeOfWork.site_property
      : {
        mine_tenure_type_code: "",
        mine_commodity_code: [],
        mine_disturbance_code: [],
      };
    if (draftPermitAmendment && !isEmpty(draftPermitAmendment)) {
      newPermitGenObj.permit_amendment_type_code = draftPermitAmendment.permit_amendment_type_code;
    }
    let amendmentType = PERMIT_AMENDMENT_TYPES.original;
    const amendments = draftPermit.permit_amendments.filter(
      (a) => a.permit_amendment_status_code !== "DFT"
    );
    if (amendments.length > 0) {
      amendmentType =
        amendments.filter(
          (a) => a.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated
        ).length > 0
          ? PERMIT_AMENDMENT_TYPES.amalgamated
          : PERMIT_AMENDMENT_TYPES.amendment;
    }

    if (amendmentType === PERMIT_AMENDMENT_TYPES.amendment) {
      const newPermitAmendmentDropdown = permitAmendmentTypeDropDownOptions.filter(
        (opt) => opt.value !== PERMIT_AMENDMENT_TYPES.original
      );
      setPermitAmendmentDropdown(newPermitAmendmentDropdown);
      setIsPermitAmendmentTypeDropDownDisabled(false);
    } else {
      setPermitAmendmentDropdown(permitAmendmentTypeDropDownOptions);
      setIsPermitAmendmentTypeDropDownDisabled(true);
    }
    return newPermitGenObj;
  };

  const createPreviousAmendmentGenObject = (permit) => {
    // gets and sorts in descending order amendments for selected permit
    const amendments = permit?.amendments && permit.amendments.filter((a) => a.permit_amendment_status_code !== "DFT")
      .sort((a, b) => (a.issue_date < b.issue_date ? 1 : b.issue_date < a.issue_date ? -1 : 0));
    const previousAmendment = amendments?.length > 0 ? amendments[0] : {};
    if (!isEmpty(previousAmendment)) {
      previousAmendment.related_documents = previousAmendment.related_documents.map((doc) => ({
        document_info: getDocumentInfo(doc),
        ...doc,
      }));
    }
    const previousAmendmentGenObject = {
      ...previousAmendment,
      issue_date: formatDate(previousAmendment.issue_date),
      authorization_end_date: formatDate(previousAmendment.authorization_end_date),
    };
    return previousAmendmentGenObject;
  };

  const getFinalApplicationPackage = () => {
    let documents = [];
    let filteredSubmissionDocuments = noticeOfWork?.filtered_submission_documents;
    let requestedDocuments = noticeOfWork?.documents;

    if (!isEmpty(filteredSubmissionDocuments)) {
      filteredSubmissionDocuments = filteredSubmissionDocuments
        ?.filter(({ is_final_package }) => is_final_package)
        .map((doc) => ({
          document_info: getDocumentInfo(doc),
          final_package_order: doc.final_package_order,
        }));
      documents = filteredSubmissionDocuments;
    }

    if (!isEmpty(requestedDocuments)) {
      requestedDocuments = requestedDocuments
        ?.filter(({ is_final_package }) => is_final_package)
        .map((doc) => ({
          document_info: getDocumentInfo(doc),
          final_package_order: doc.final_package_order,
        }));
      documents = [...documents, ...requestedDocuments];
    }

    documents.sort((a, b) => a.final_package_order - b.final_package_order);
    return documents;
  };

  const handlePermitGenSubmit = () => {
    const newValues = { ...formValues };

    if (isAmendment) {
      newValues.original_permit_issue_date = formatDate(formValues.original_permit_issue_date);

      if (newValues.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated) {
        const permit = permits.find((p) => p.permit_no === newValues.permit_number);
        // @ts-ignore: previous_amendment not on type matching form
        newValues.previous_amendment = createPreviousAmendmentGenObject(permit);
      }
    }
    setDownloadingDraft(true);
    return handleGenerateDocumentFormSubmit(documentType, {
      ...newValues,
      auth_end_date: formatDate(formValues?.auth_end_date),
      application_dated: formatDate(newValues.application_date),
      final_application_package: getFinalApplicationPackage(),
    }).finally(() => setDownloadingDraft(false));
  };

  const focusErrorInput = () => {
    dispatch(submit(FORM.GENERATE_PERMIT));
    const errors = Object.keys(flattenObject(formErrors));
    const errorElement = document.querySelector(`[name="${errors[0]}"]`);
    if (errorElement instanceof HTMLElement) {
      errorElement.focus();
    }
  };

  const handleCancelDraftEdit = () => {
    dispatch(reset(FORM.GENERATE_PERMIT));
    toggleEditMode();
  };

  const handleSaveDraftEdit = () => {
    const errors = Object.keys(flattenObject(formErrors));
    if (errors.length > 0) {
      focusErrorInput();
      return;
    }

    const transformDocumentsMetadata = (documentsMetadata) => {
      const allFileMetadata = {};
      if (isEmpty(documentsMetadata)) {
        return allFileMetadata;
      }
      for (const [key, value] of Object.entries(documentsMetadata)) {
        // Extract required information from the field ID (e.g., 1c943015-29ed-433c-bfb1-d5ed14db103e_preamble_title).
        const fieldIdParts = key.split(/_(.+)/);
        const guid = fieldIdParts[0];
        const fieldName = fieldIdParts[1];
        if (guid && guid !== "null") {
          if (!(guid in allFileMetadata)) {
            allFileMetadata[guid] = {};
          }
          allFileMetadata[guid][fieldName] = value;
        }
      }
      return allFileMetadata;
    };

    setIsLoaded(false);

    const payload = {
      issuing_inspector_title: formValues.issuing_inspector_title,
      regional_office: formValues.regional_office,
      issue_date: formValues.issue_date,
      authorization_end_date: formValues.auth_end_date,
      permit_amendment_type_code: formValues.permit_amendment_type_code,
      final_original_documents_metadata: JSON.stringify(
        transformDocumentsMetadata(formValues.final_original_documents_metadata)
      ),
      final_requested_documents_metadata: JSON.stringify(
        transformDocumentsMetadata(formValues.final_requested_documents_metadata)
      ),
      previous_amendment_documents_metadata: JSON.stringify(
        transformDocumentsMetadata(formValues.previous_amendment_documents_metadata)
      ),
      site_properties: formValues.site_property,
      preamble_text: formValues.preamble_text,
    };

    return dispatch(updatePermitAmendment(
      noticeOfWork.mine_guid,
      draftPermit.permit_guid,
      draftPermitAmendment.permit_amendment_guid,
      payload
    ))
      .then(() => onPermitDraftSave())
      .then(() => {
        handleDraftPermit();
        toggleEditMode();
      });
  };

  const handleSavePreamble = () => {
    setIsLoaded(false);
    const payload = {
      preamble_text: formValues.preamble_text,
    };

    return dispatch(updatePermitAmendment(
      noticeOfWork.mine_guid,
      draftPermit.permit_guid,
      draftPermitAmendment.permit_amendment_guid,
      payload
    )).then(() => onPermitDraftSave())
      .then(() => {
        handleDraftPermit();
        dispatch(storeEditingPreambleFlag(false));
      });
  };

  const handleCancelPreambleTextEdit = () => {
    dispatch(reset(FORM.GENERATE_PERMIT));
    dispatch(storeEditingPreambleFlag(false));
  };

  const handleDraftPermit = () => {
    setPermitGenObj(null);
    return dispatch(fetchDraftPermitByNOW(
      noticeOfWork.mine_guid,
      noticeOfWork.now_application_guid
    ));
  };

  const fetchDraftPermit = () => {
    dispatch(fetchPermits(noticeOfWork.mine_guid));
    handleDraftPermit();
  };

  useEffect(() => {
    if (noticeOfWork) {
      fetchDraftPermit();
    }
  }, [noticeOfWork]);

  useEffect(() => {
    const currentPermittee = noticeOfWork.contacts.filter((contact) =>
      contact.mine_party_appt_type_code_description === "Permittee"
    );
    setPermittee(currentPermittee);
  }, [noticeOfWork.contacts]);

  useEffect(() => {
    if (!isEmpty(draftPermitAmendment)) {
      const newPermitGenObj = createPermitGenObject();
      setPermitGenObj(newPermitGenObj);
    }
    setIsLoaded(true);
  }, [draftPermitAmendment]);

  const handleDeleteDraftPermit = () => {
    dispatch(deletePermit(noticeOfWork.mine_guid, draftPermit.permit_guid))
      .then(() => {
        dispatch(closeModal());
        setIsLoaded(false);
        handleDraftPermit();
      });
  };

  const handleDeleteDraftPermitAmendment = () => {
    dispatch(deletePermitAmendment(noticeOfWork.mine_guid, draftPermit.permit_guid, draftPermitAmendment.permit_amendment_guid))
      .then(() => {
        dispatch(closeModal());
        setIsLoaded(false);
        handleDraftPermit();
      });
  };

  const openDeleteDraftPermitModal = (event) => {
    event.preventDefault();
    dispatch(openModal({
      props: {
        title: "Delete Draft Permit",
        handleDelete: isAmendment
          ? handleDeleteDraftPermitAmendment
          : handleDeleteDraftPermit,
      },
      content: DeleteDraftPermitModal
    }));
  };

  // If applicable, get the previous amendment documents and their form's initial values.
  let previousAmendmentDocuments;
  let previousAmendmentDocumentsMetadataInitialValues;

  if (isAmendment && formValues?.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated) {
    const permit = permits.find((p) => p.permit_no === formValues?.permit_number);
    const previousAmendment = createPreviousAmendmentGenObject(permit);
    previousAmendmentDocuments = previousAmendment.related_documents;
    previousAmendmentDocumentsMetadataInitialValues = getDocumentsMetadataInitialValues(
      previousAmendmentDocuments,
      "permit_amendment_document_guid"
    );
  }

  const nowType = noticeOfWork.type_of_application ?? "";

  const isProcessed = ['AIA', 'WDN', 'REJ', 'NPR'].includes(noticeOfWork.now_application_status_code);
  const draftInProgress = progress.DFT?.start_date && progress.DFT?.end_date;

  const hasDraftBeenDeleted = isEmpty(draftPermitAmendment) && draftInProgress;
  const isDraft = !isEmpty(draftPermitAmendment);

  return (
    <div>
      <NOWTabHeader
        tab="DFT"
        tabActions={
          isDraft && (
            <>
              {" "}
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT" ignoreDelay>
                <Button className="form-btn" danger type="primary" onClick={(event) => openDeleteDraftPermitModal(event)}>
                  Delete Draft
                </Button>
              </NOWActionWrapper>
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT" ignoreDelay>
                <Button type="default" onClick={toggleEditMode}>
                  <img alt="EDIT_OUTLINE" className="padding-small--right" src={EDIT_OUTLINE} />
                  Edit
                </Button>
              </NOWActionWrapper>
              {draftPermitAmendment.has_permit_conditions && (
                <Button
                  className="full-mobile"
                  type="default"
                  onClick={handlePermitGenSubmit}
                  loading={downloadingDraft}
                  disabled={
                    isEmpty(permittee) ||
                    !noticeOfWork?.issuing_inspector?.signature
                  }
                  title={
                    isEmpty(permittee) ||
                      !noticeOfWork?.issuing_inspector?.signature
                      ? "The application must have a permittee assigned, and the issuing inspector must have a signature before viewing the draft."
                      : ""
                  }
                >
                  <DownloadOutlined className="padding-small--right icon-sm" />
                  Download Draft
                </Button>
              )}
            </>
          )
        }
        tabName={`Draft ${nowType}`}
        handleDraftPermit={handleDraftPermit}
        fixedTop={fixedTop}
        noticeOfWork={noticeOfWork}
        tabEditActions={
          <>
            <Popconfirm
              placement="bottomRight"
              title="You have unsaved changes. Are you sure you want to cancel?"
              onConfirm={() => {
                handleCancelDraftEdit();
              }}
              okText="Yes"
              cancelText="No"
              disabled={submitting}
            >
              <Button type="default" className="full-mobile" disabled={submitting}>
                Cancel
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              className="full-mobile"
              onClick={() => {
                handleSaveDraftEdit();
              }}
              loading={submitting}
            >
              Save
            </Button>
          </>
        }
        isEditMode={!isViewMode}
        isNoticeOfWorkTypeDisabled={isNoticeOfWorkTypeDisabled}
      />
      <div className={fixedTop ? "side-menu--fixed" : "side-menu"}>
        {isDraft && <NOWSideMenu tabSection="draft-permit" />}
      </div>
      <div
        className={
          fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
        }
      >
        <>
          {isProcessed ? (
            <LoadingWrapper condition={isLoaded}>
              <h3 style={{ textAlign: "center", paddingTop: "20px" }}>
                This application has been processed.
              </h3>
            </LoadingWrapper>
          ) : (
            <>
              {!isDraft ? (
                <LoadingWrapper condition={isLoaded}>
                  <NullScreen
                    type="draft-permit"
                    message={
                      !hasDraftBeenDeleted ? (
                        <>Click &quot;Start Draft Permit&quot; to start the drafting process.</>
                      ) : (
                        <>
                          Click &quot;Create Draft Permit&quot; to continue the drafting process.
                        </>
                      )
                    }
                  />
                </LoadingWrapper>
              ) : (
                <GeneratePermitForm
                  initialValues={{
                    ...permitGenObj,
                    final_requested_documents_metadata: getDocumentsMetadataInitialValues(
                      noticeOfWork?.documents,
                      "now_application_document_xref_guid"
                    ),
                    final_original_documents_metadata: getDocumentsMetadataInitialValues(
                      noticeOfWork?.filtered_submission_documents,
                      "now_application_document_xref_guid"
                    ),
                    previous_amendment_documents_metadata: previousAmendmentDocumentsMetadataInitialValues,
                  }}
                  isAmendment={isAmendment}
                  previousAmendmentDocuments={previousAmendmentDocuments}
                  noticeOfWork={noticeOfWork}
                  isViewMode={isViewMode}
                  isLoaded={isLoaded}
                  permitAmendmentDropdown={permitAmendmentDropdown}
                  isPermitAmendmentTypeDropDownDisabled={
                    isPermitAmendmentTypeDropDownDisabled
                  }
                  draftPermit={draftPermit}
                  draftPermitAmendment={draftPermitAmendment}
                  handleSavePreamble={handleSavePreamble}
                  handleCancelPreambleTextEdit={handleCancelPreambleTextEdit}
                />
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
};

export default NOWPermitGeneration;