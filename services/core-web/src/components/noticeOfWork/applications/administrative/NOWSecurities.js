/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { openModal, closeModal } from "@common/actions/modalActions";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";

import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE } from "@/constants/assets";

/**
 * @class NOWSecurities- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

const securityDocuments = ["SRB", "NIA", "AKL", "SCD"];

export class NOWSecurities extends Component {
  // openAddDocumentModal = (
  // ) => {
  //   openModal({
  //     props: {
  //       onSubmit: debounce(handleAddDocument(closeDocumentModal, addDocument), 2000),
  //       title: `Add Notice of Work document`,
  //       now_application_guid: this.props.noticeOfWork),
  //       mine_guid,
  //       categoriesToShow,
  //     },
  //     content: modalConfig.EDIT_NOTICE_OF_WORK_DOCUMENT,
  //   });
  // };

  render() {
    return (
      <div>
        <div className="inline-flex between">
          <h4>Securities</h4>
          <div>
            <Button type="secondary" onClick={this.openDocumentModal}>
              <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
              Add
            </Button>
          </div>
        </div>
        <p>
          Upload a copy of the security into the table below before sending the original to the
          Securities Team.
        </p>
        <NOWDocuments
          now_application_guid={this.props.noticeOfWork.now_application_guid}
          mine_guid={this.props.mineGuid}
          documents={this.props.noticeOfWork.documents.filter(
            ({ now_application_document_type_code }) =>
              securityDocuments.includes(now_application_document_type_code)
          )}
          isViewMode={false}
          categoriesToShow={securityDocuments}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({ openModal, closeModal }, dispatch);

NOWSecurities.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NOWSecurities);
