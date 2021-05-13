import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Button } from "antd";
import LinkButton from "@/components/common/LinkButton";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@common/actions/modalActions";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import {
  updatePermitAmendment,
  removePermitAmendmentDocument,
  fetchDraftPermitByNOW,
} from "@common/actionCreators/permitActionCreator";
import { PERMIT, CLOUD_CHECK_MARK } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import PermitDocumentTable from "@/components/noticeOfWork/applications/permitGeneration/PermitDocumentTable";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  NoWGuid: PropTypes.string.isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
  isViewMode: PropTypes.bool.isRequired,
};
const renderDocumentLink = (file, text) => (
  <LinkButton key={file.mine_document_guid} onClick={() => downloadFileFromDocumentManager(file)}>
    {text}
  </LinkButton>
);

export class UploadPermitDocument extends Component {
  openPermitUploadModal = (event) => {
    event.preventDefault();
    return this.props.openModal({
      props: {
        title: `Upload Permit Document`,
        onSubmit: this.handlePermitUpload,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.UPLOAD_PERMIT_DOCUMENT_MODAL,
    });
  };

  handlePermitUpload = (values) => {
    return this.props
      .updatePermitAmendment(
        this.props.mineGuid,
        this.props.draftPermit.permit_guid,
        this.props.draftPermitAmendment.permit_amendment_guid,
        values
      )
      .then(() => {
        this.props.fetchDraftPermitByNOW(this.props.mineGuid, this.props.NoWGuid);
      })
      .finally(this.props.closeModal());
  };

  handleRemovePermitAmendmentDocument = (event, documentGuid) => {
    event.preventDefault();
    return this.props
      .removePermitAmendmentDocument(
        this.props.mineGuid,
        this.props.draftPermit.permit_guid,
        this.props.draftPermitAmendment.permit_amendment_guid,
        documentGuid
      )
      .then(() => {
        this.props.fetchDraftPermitByNOW(this.props.mineGuid, this.props.NoWGuid);
      });
  };

  render() {
    const hasDocuments = this.props.draftPermitAmendment?.related_documents.length > 0;
    return (
      <div>
        {hasDocuments ? (
          // <PermitDocumentTable
          //   draftPermitAmendment={this.props.draftPermitAmendment}
          //   handleRemovePermitAmendmentDocument={this.handleRemovePermitAmendmentDocument}
          //   isViewMode={this.props.isViewMode}
          // />
          <div className="null-screen">
            <img alt="document_img" src={CLOUD_CHECK_MARK} />
            <h3> Permit Uploaded</h3>
            <div>
              <p>
                Document Name:{" "}
                {renderDocumentLink(
                  this.props.draftPermitAmendment.related_documents[0],
                  truncateFilename(
                    this.props.draftPermitAmendment.related_documents[0].document_name
                  )
                )}
              </p>
              <p>Date Uploaded:</p>
              {!this.props.isViewMode && (
                <>
                  <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
                    <Button
                      type="danger"
                      onClick={(event) =>
                        this.handleRemovePermitAmendmentDocument(
                          event,
                          this.props.draftPermitAmendment.related_documents[0]
                            .permit_amendment_document_guid
                        )
                      }
                    >
                      Delete Document
                    </Button>
                  </NOWActionWrapper>
                  {/* <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
                    <Button
                      type="primary"
                      onClick={(event) =>
                        this.handleRemovePermitAmendmentDocument(
                          event,
                          this.props.draftPermitAmendment.related_documents[0]
                            .permit_amendment_document_guid
                        )
                      }
                    >
                      Delete & Upload New
                    </Button>
                  </NOWActionWrapper> */}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="null-screen">
            <img alt="document_img" src={PERMIT} />
            <div>
              <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
                <Button type="primary" onClick={this.openPermitUploadModal}>
                  Upload Permit Document
                </Button>
              </NOWActionWrapper>
            </div>
          </div>
        )}
      </div>
    );
  }
}

UploadPermitDocument.propTypes = propTypes;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updatePermitAmendment,
      removePermitAmendmentDocument,
      fetchDraftPermitByNOW,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(UploadPermitDocument);
