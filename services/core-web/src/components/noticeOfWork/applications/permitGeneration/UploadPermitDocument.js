import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Button } from "antd";
import { isEmpty } from "lodash";
import DocumentLink from "@/components/common/DocumentLink";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { truncateFilename } from "@common/utils/helpers";
import {
  updatePermitAmendment,
  removePermitAmendmentDocument,
  fetchDraftPermitByNOW,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { PERMIT, CLOUD_CHECK_MARK } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  NoWGuid: PropTypes.string.isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  removePermitAmendmentDocument: PropTypes.func.isRequired,
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
};

const renderDocumentLink = (document) => (
  <DocumentLink
    documentManagerGuid={document.document_manager_guid}
    documentName={document.document_name}
  />
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
    const hasDocuments =
      !isEmpty(this.props.draftPermitAmendment) &&
      this.props.draftPermitAmendment.related_documents.length > 0;
    return (
      <div>
        {hasDocuments ? (
          <div className="null-screen">
            <img alt="document_img" src={CLOUD_CHECK_MARK} />
            <h3> Permit Uploaded</h3>
            <div>
              <p>
                Document Name:{" "}
                {renderDocumentLink(this.props.draftPermitAmendment.related_documents[0])}
              </p>
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
