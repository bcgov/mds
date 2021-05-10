import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import LinkButton from "@/components/common/LinkButton";
import { truncateFilename } from "@common/utils/helpers";
import { openDocument } from "@/components/syncfusion/DocumentViewer";

const propTypes = {
  documentManagerGuid: PropTypes.string.isRequired,
  documentName: PropTypes.string.isRequired,
  openDocument: PropTypes.func.isRequired,
  linkTitleOverride: PropTypes.string,
  truncateDocumentName: PropTypes.bool,
};

const defaultProps = {
  linkTitleOverride: null,
  truncateDocumentName: true,
};

const DocumentLink = (props) => (
  <LinkButton
    title={props.documentName}
    onClick={() => props.openDocument(props.documentManagerGuid, props.documentName)}
  >
    {props.linkTitleOverride
      ? props.linkTitleOverride
      : props.truncateDocumentName
      ? truncateFilename(props.documentName)
      : props.documentName}
  </LinkButton>
);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openDocument,
    },
    dispatch
  );

DocumentLink.propTypes = propTypes;
DocumentLink.defaultProps = defaultProps;

export default connect(null, mapDispatchToProps)(DocumentLink);
