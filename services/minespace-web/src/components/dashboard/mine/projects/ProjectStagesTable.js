import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Table, Button } from "antd";
import * as routes from "@/constants/routes";

const propTypes = {
  projectStages: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export class ProjectStagesTable extends Component {
  transformRowData = (projectStages) =>
    projectStages &&
    projectStages.map((stage) => ({
      key: stage.key,
      project_stage: stage.title,
      stage_status: stage.status,
      stage_status_hash: stage.statusHash,
      stage,
    }));

  columns = () => [
    {
      title: "",
      dataIndex: "project_stage",
      render: (text) => (
        <div title="Project Stage">
          <b>{text}</b>
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "stage_status",
      render: (text, record) => {
        const status =
          record.stage_status === undefined ? "Not Started" : record.stage_status_hash[text];
        return (
          <div title="Stage Status">
            <b>{status || "N/A"}</b>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "stage",
      align: "right",
      render: (text, record) => {
        let link;
        if (record.project_stage === "Project description") {
          link = (
            <Link
              to={routes.EDIT_PROJECT_SUMMARY.dynamicRoute(
                record.stage?.payload?.project_guid,
                record.stage?.payload?.project_summary_guid
              )}
            >
              <Button className="full-mobile margin-small" type="secondary">
                Edit
              </Button>
            </Link>
          );
        }
        if (record.project_stage === "IRT") {
          link = (
            <Link
              to={routes.ADD_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                record.stage?.project_guid
              )}
            >
              <Button className="full-mobile margin-small" type="secondary">
                {record.stage_status ? "View" : "Start"}
              </Button>
            </Link>
          );
        }
        return link;
      },
    },
  ];

  render() {
    return (
      <Table
        size="small"
        showHeader={false}
        pagination={false}
        columns={this.columns()}
        dataSource={this.transformRowData(this.props.projectStages)}
        locale={{ emptyText: "This project has no stage data." }}
      />
    );
  }
}

ProjectStagesTable.propTypes = propTypes;

export default ProjectStagesTable;
