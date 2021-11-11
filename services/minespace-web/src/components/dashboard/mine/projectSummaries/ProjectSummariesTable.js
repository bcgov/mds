import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Button } from "antd";
import { truncateFilename, dateSorter } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import { RED_CLOCK } from "@/constants/assets";
import * as Strings from "@/constants/strings";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  openEditVarianceModal: PropTypes.func,
  openViewVarianceModal: PropTypes.func,
};

const defaultProps = {
  openEditVarianceModal: () => {},
  openViewVarianceModal: () => {},
};

export class ProjectSummariesTable extends Component {

  transformRowData = (projectSummaries, codeHash, typeHash) =>
  projectSummaries &&
  projectSummaries.map((projectSummary) => ({
      key: projectSummary.project_summary_guid,
      projectSummary,
      project_summary_id: projectSummary.project_summary_id,
      project_summary_lead_name: projectSummary.project_summary_lead_name,
      status_code: codeHash[projectSummary.status_code],
      project_summary_date: formatDate(projectSummary.project_summary_date) || Strings.EMPTY_FIELD,
      project_summary_description: projectSummary.project_summary_description,
      documents: projectSummary.documents,
    }));

  handleOpenModal = (event, isEditable, variance) => {
    event.preventDefault();
    if (isEditable) {
      this.props.openEditVarianceModal(variance);
    } else {
      this.props.openViewVarianceModal(variance);
    }
  };

  columns = () => [
    {
      title: "Project Summary No.",
      dataIndex: "project_summary_id",
      sorter: (a, b) => (a.project_summary_id > b.project_summary_id ? -1 : 1),
      render: (text) => <div title="Project Summary No.">{text}</div>,
    },
    {
      title: "Submitted On",
      dataIndex: "project_summary_date",
      render: (text) => <div title="Submitted On">{text}</div>,
      sorter: dateSorter("project_summary_date"),
    },
    {
      title: "Status",
      dataIndex: "status_code",
      render: (text) => <div title="Status">{text}</div>,
      sorter: (a, b) => (a.status_code > b.status_code ? -1 : 1),
    },
    {
      title: "Description",
      dataIndex: "project_summary_description",
      render: (text) => <div title="Description">{text}</div>,
      sorter: (a, b) => (a.project_summary_description > b.project_summary_description ? -1 : 1),
    },
    {
      title: "Lead By",
      dataIndex: "project_summary_lead_name",
      sorter: (a, b) => (a.project_summary_lead_name > b.project_summary_lead_name ? -1 : 1),
      render: (text) => <div title="Lead">{text}</div>,
    },
    {
      title: "Documents",
      dataIndex: "documents",
      render: (text, record) => {
        return (
          <div title="Documents" className="cap-col-height">
            {record.documents.length > 0
              ? record.documents.map((file) => (
                  <div key={file.mine_document_guid}>
                    <LinkButton title={text} onClick={() => downloadFileFromDocumentManager(file)}>
                      {truncateFilename(file.document_name)}
                    </LinkButton>
                  </div>
                ))
              : Strings.EMPTY_FIELD}
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "projectSummary",
      render: (text, record) => (
        <div title="" align="right">
          <Button
            type="primary"
            size="small"
            onClick={(event) => this.handleOpenModal(event, record.isEditable, record.projectSummary)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  render() {
    return (
      <Table
        size="small"
        pagination={false}
        loading={!this.props.isLoaded}
        columns={this.columns()}
        dataSource={this.transformRowData(
          this.props.projectSummaries,
          this.props.projectSummaryStatusCodesHash,
          this.props.projectSummaryDocumentTypesHash,
        )}
        locale={{ emptyText: "This mine has no project summary data." }}
      />
    );
  }
}

ProjectSummariesTable.propTypes = propTypes;
ProjectSummariesTable.defaultProps = defaultProps;

export default ProjectSummariesTable;
