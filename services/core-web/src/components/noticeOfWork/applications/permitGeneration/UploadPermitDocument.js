import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Button } from "antd";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@common/actions/modalActions";
import { PERMIT } from "@/constants/assets";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export class UploadPermitDocument extends Component {
  openPermitUploadModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        title: `Upload Permit Document`,
        onSubmit: this.handlePermitUpload,
      },
      content: modalConfig.UPLOAD_PERMIT_DOCUMENT_MODAL,
    });
  };

  handlePermitUpload = (values) => {
    console.log(values);
  };

  render() {
    return (
      <div>
        <img alt="document_img" src={PERMIT} />
        <Button type="primary" onClick={this.openPermitUploadModal}>
          Upload Permit Document
        </Button>
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
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(UploadPermitDocument);
