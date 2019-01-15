import React, { Component } from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getMineDocuments } from "@/selectors/mineSelectors";
import {
  fetchMineDocuments,
  addMineDocumentToExpectedDocument,
} from "@/actionCreators/mineActionCreator";
import { UPLOAD_MINE_EXPECTED_DOCUMENT_FILE } from "@/constants/API";
import { createDropDownList } from "@/utils/helpers";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";
import FilePicker from "@/components/common/FilePicker";

const propTypes = {
  selectedDocument: CustomPropTypes.mineExpectedDocument.isRequired,
  addMineDocumentToExpectedDocument: PropTypes.func.isRequired,
  fetchMineDocuments: PropTypes.func.isRequired,
  mineDocuments: PropTypes.arrayOf(CustomPropTypes.mineDocument).isRequired,
};

class MineTailingsFilePicker extends Component {
  componentWillMount() {
    this.props.fetchMineDocuments(this.props.selectedDocument.mine_guid);
  }

  handleFileSelect = (mineDocumentGuid) => {
    const data = { mine_document_guid: mineDocumentGuid };
    this.props.addMineDocumentToExpectedDocument(
      this.props.selectedDocument.exp_document_guid,
      data
    );
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
      addMineDocumentToExpectedDocument,
    },
    dispatch
  );

MineTailingsFilePicker.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsFilePicker);
