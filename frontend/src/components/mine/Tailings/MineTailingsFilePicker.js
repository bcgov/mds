import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import { getMineDocuments } from "@/selectors/mineSelectors";
import {
  fetchMineDocuments,
  addDocumentToExpectedDocument,
  fetchMineRecordById,
} from "@/actionCreators/mineActionCreator";
import { UPLOAD_MINE_EXPECTED_DOCUMENT_FILE } from "@/constants/API";
import { createDropDownList } from "@/utils/helpers";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import FilePicker from "@/components/common/FilePicker";

const propTypes = {
  selectedDocument: CustomPropTypes.mineExpectedDocument.isRequired,
  addDocumentToExpectedDocument: PropTypes.func.isRequired,
  fetchMineDocuments: PropTypes.func.isRequired,
  mineDocuments: PropTypes.arrayOf(CustomPropTypes.mineDocument).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

class MineTailingsFilePicker extends Component {
  componentWillMount() {
    this.props.fetchMineDocuments(this.props.selectedDocument.mine_guid);
  }

  handleFileSelect = (mine_document_guid) => {
    this.pushDocument({ mine_document_guid });
  };

  handleFileLoad = (filename, document_manager_guid) => {
    this.pushDocument({ filename, document_manager_guid });
  };

  pushDocument = (formData) => {
    this.props
      .addDocumentToExpectedDocument(this.props.selectedDocument.exp_document_guid, formData)
      .then(() => this.props.fetchMineRecordById(this.props.selectedDocument.mine_guid));
  };

  render() {
    const fileDropdown = createDropDownList(
      this.props.mineDocuments,
      "document_name",
      "mine_document_guid"
    );

    return (
      <FilePicker
        uploadUrl={UPLOAD_MINE_EXPECTED_DOCUMENT_FILE(
          this.props.selectedDocument.exp_document_guid
        )}
        acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
        existingFilesDropdown={fileDropdown}
        onSelectExisting={this.handleFileSelect}
        onFileLoad={this.handleFileLoad}
        maxFileSize="400MB"
      />
    );
  }
}

const mapStateToProps = (state) => ({
  mineDocuments: getMineDocuments(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineDocuments,
      addDocumentToExpectedDocument,
      fetchMineRecordById,
    },
    dispatch
  );

MineTailingsFilePicker.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsFilePicker);
