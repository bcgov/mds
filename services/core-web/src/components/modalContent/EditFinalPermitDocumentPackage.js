import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Popconfirm } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import NOWDocuments from "../noticeOfWork/applications/NOWDocuments";
import NOWSubmissionDocuments from "../noticeOfWork/applications/NOWSubmissionDocuments";

const propTypes = {
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  finalDocuments: PropTypes.arrayOf(PropTypes.strings).isRequired,
  finalSubmissionDocuments: PropTypes.arrayOf(PropTypes.strings).isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  noticeOfWorkGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  importNowSubmissionDocumentsJob: {},
};

export const EditFinalPermitDocumentPackage = (props) => {
  const [selectedCoreRows, setSelectedCoreRows] = useState(props.finalDocuments);
  const [selectedSubmissionRows, setSelectedSubmissionRows] = useState(
    props.finalSubmissionDocuments
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const applicationFilesTypes = ["AAF", "AEF", "MDO", "SDO"];

  const handleSubmit = () => {
    setIsSubmitting(true);
    return props
      .onSubmit(selectedCoreRows, selectedSubmissionRows)
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div>
      <h4>Application Documents</h4>
      <NOWSubmissionDocuments
        now_application_guid={props.noticeOfWorkGuid}
        documents={props.noticeOfWork.filtered_submission_documents.concat(
          props.noticeOfWork.documents
            ?.filter(
              ({
                now_application_document_sub_type_code,
                now_application_document_type_code,
                mine_document,
              }) =>
                mine_document?.mine_document_guid && applicationFilesTypes.includes(now_application_document_sub_type_code) &&
                (now_application_document_type_code !== "PMT" ||
                  now_application_document_type_code !== "PMA" ||
                  mine_document.document_name.includes("DRAFT"))
            )
            .map((doc) => {
              return {
                preamble_author: doc.preamble_author,
                preamble_date: doc.preamble_date,
                preamble_title: doc.preamble_title,
                now_application_document_xref_guid: doc.now_application_document_xref_guid,
                is_referral_package: doc.is_referral_package,
                is_final_package: doc.is_final_package,
                is_consultation_package: doc.is_consultation_package,
                description: doc.description,
                mine_document_guid: doc.mine_document.mine_document_guid,
                filename: doc.mine_document.document_name,
                document_manager_guid: doc.mine_document.document_manager_guid,
                notForImport: true,
                ...doc,
              };
            })
        )}
        importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
        selectedRows={{ selectedSubmissionRows, setSelectedSubmissionRows }}
        isPackageModal
        isAdminView
        isViewMode
      />
      <br />
      <h4>Government Documents</h4>
      <NOWDocuments
        documents={props.documents}
        isViewMode
        selectedRows={{ selectedCoreRows, setSelectedCoreRows }}
        categoriesToShow={["GDO"]}
        isPackageModal
      />
      <br />
      <div className="right center-mobile padding-md--top">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
          disabled={isSubmitting}
        >
          <Button className="full-mobile" disabled={isSubmitting}>
            Cancel
          </Button>
        </Popconfirm>
        <Button
          className="full-mobile"
          type="primary"
          onClick={() => handleSubmit()}
          loading={isSubmitting}
        >
          <DownloadOutlined className="padding-sm--right icon-sm" />
          Save Application Package
        </Button>
      </div>
    </div>
  );
};

EditFinalPermitDocumentPackage.propTypes = propTypes;
EditFinalPermitDocumentPackage.defaultProps = defaultProps;

export default EditFinalPermitDocumentPackage;
