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
      stage_required: stage.required,
      navigate_forward: stage.navigateForward,
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
      dataIndex: "stage_required",
      render: (text, record) => {
        const label = record.stage_required ? "Required" : "Optional";
        return record.stage_required !== null ? (
          <div title="Stage Required">
            <b>{label || "N/A"}</b>
          </div>
        ) : null;
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
                Resume
              </Button>
            </Link>
          );
        }
        if (record.project_stage === "IRT") {
          let buttonLabel;
          if (!record.stage_status) {
            buttonLabel = "Start";
          } else if (record.stage_status === "APV") {
            buttonLabel = "View";
          } else {
            buttonLabel = "Resume";
          }

          link = (
            <Button
              className="full-mobile margin-small"
              type="secondary"
              onClick={() => record?.navigate_forward()}
            >
              {buttonLabel}
            </Button>
          );
        }
        if (record.project_stage === "Application") {
          let buttonLabel;
          if (!record.stage_status) {
            buttonLabel = "Start";
          } else if (["SUB", "UNR", "APV"].includes(record.stage_status)) {
            buttonLabel = "View";
          } else {
            buttonLabel = "Resume";
          }

          link = (
            <Button
              className="full-mobile margin-small"
              type="secondary"
              onClick={() => record?.navigate_forward()}
            >
              {buttonLabel}
            </Button>
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
