import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import { getProjectSummaryStatusCodesHash } from "@common/selectors/staticContentSelectors";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.projectSummary).isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

export class MineProjectSummaryTable extends Component {
  transformRowData = (projectSummaries) =>
    projectSummaries.map((projectSummary) => ({
      key: projectSummary.project_summary_guid,
      projectSummary,
      mine_guid: projectSummary.mine_guid,
      status_code: projectSummary.status_code,
      documents: projectSummary.documents,
      project_summary_id: projectSummary.project_summary_id || Strings.EMPTY_FIELD,
      update_timestamp: formatDate(projectSummary.formatDate),
    }));

  render() {
    const columns = [
      {
        title: "Project ID",
        dataIndex: "project_summary_id",
        sortField: "project_summary_id",
        render: (text) => <div title="Project ID">{text}</div>,
      },
      {
        title: "Project stage",
        dataIndex: "status_code",
        sortField: "status_code",
        render: (text) => (
          <div title="Project stage">
            {this.props.projectSummaryStatusCodesHash[text] || Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "Last updated",
        dataIndex: "update_timestamp",
        sortField: "update_timestamp",
        render: (text) => <div title="Submission Date">{text}</div>,
      },
      {
        title: "Files",
        dataIndex: "documents",
        render: (text, record) => (
          <div title="Files">
            {record.documents.length > 0
              ? record.documents.map((file) => (
                  <div key={file.mine_document_guid} title={file.document_name}>
                    <DocumentLink
                      documentManagerGuid={file.document_manager_guid}
                      documentName={file.document_name}
                    />
                  </div>
                ))
              : Strings.EMPTY_FIELD}
          </div>
        ),
      },
    ];

    return (
      <CoreTable
        condition={this.props.isLoaded}
        columns={columns}
        dataSource={this.transformRowData(this.props.projectSummaries)}
        tableProps={{
          align: "left",
        }}
      />
    );
  }
}

MineProjectSummaryTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
});

export default connect(mapStateToProps)(MineProjectSummaryTable);
