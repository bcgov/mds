import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Progress, Popconfirm } from "antd";
import { getDocumentDownloadState } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import NOWDocuments from "../noticeOfWork/applications/NOWDocuments";

const propTypes = {
  coreDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  noticeOfWorkGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  onSubmit: PropTypes.func.isRequired,
  handleSavePackage: PropTypes.func.isRequired,
  cancelDownload: PropTypes.func.isRequired,
  documentDownloadState: CustomPropTypes.documentDownloadState.isRequired,
  closeModal: PropTypes.func.isRequired,
  coreDocumentsInPackage: PropTypes.arrayOf(PropTypes.string).isRequired,
  submissionDocumentsInPackage: PropTypes.arrayOf(PropTypes.string).isRequired,
  type: PropTypes.string.isRequired,
};

const defaultProps = {
  importNowSubmissionDocumentsJob: {},
};

export const DownloadDocumentPackageModal = (props) => {
  const [selectedCoreRows, setSelectedCoreRows] = useState(props.coreDocumentsInPackage);
  const [selectedSubmissionRows, setSelectedSubmissionRows] = useState(
    props.submissionDocumentsInPackage
  );
  const applicationFilesTypes = ["AAF", "AEF", "MDO", "SDO"];

  return props.documentDownloadState.downloading ? (
    <div className="inline-flex flex-flow-column horizontal-center">
      <h4>Downloading Selected Files...</h4>
      <Progress
        className="padding-md--top padding-lg--bottom"
        strokeColor={COLOR.violet}
        type="circle"
        percent={Math.round(
          (props.documentDownloadState.currentFile / props.documentDownloadState.totalFiles) * 100
        )}
      />
      <Button className="full-mobile" type="secondary" onClick={() => props.cancelDownload()}>
        Cancel
      </Button>
    </div>
  ) : (
    <>
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
                  applicationFilesTypes.includes(now_application_document_sub_type_code) &&
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
          isAdminView
          isPackageModal
          isViewMode
        />
        <br />
        <h4>Government Documents</h4>
        <NOWDocuments
          documents={props.coreDocuments}
          isViewMode
          selectedRows={{ selectedCoreRows, setSelectedCoreRows }}
          isPackageModal
          categoriesToShow={["GDO"]}
        />
        <br />
        <div className="right center-mobile padding-md--top">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile">Cancel</Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="tertiary"
            onClick={() => props.onSubmit(selectedCoreRows, selectedSubmissionRows)}
          >
            <DownloadOutlined className="padding-sm--right icon-sm" />
            Download Referral Package
          </Button>
          <NOWActionWrapper
            permission={Permission.EDIT_PERMITS}
            tab={props.type === "FNC" ? "CON" : props.type}
            isDisabledReviewButton
          >
            <Button
              type="primary"
              className="full-mobile"
              onClick={() => props.handleSavePackage(selectedCoreRows, selectedSubmissionRows)}
            >
              Save and Exit
            </Button>
          </NOWActionWrapper>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  documentDownloadState: getDocumentDownloadState(state),
});

DownloadDocumentPackageModal.propTypes = propTypes;
DownloadDocumentPackageModal.defaultProps = defaultProps;

export default connect(mapStateToProps)(DownloadDocumentPackageModal);
