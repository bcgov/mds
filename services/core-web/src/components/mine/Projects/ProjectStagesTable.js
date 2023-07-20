import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table } from "antd";

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
      link: stage.link,
      stage,
    }));

  columns = () => [
    {
      title: "",
      dataIndex: "project_stage",
      render: (text, record) => (
        <div title="Project Stage">
          {!(record.stage.isOptional || record.stage.isTitle) ? (
            <b>{text}</b>
          ) : (
            <div className={record.stage.isOptional && !record.stage.isTitle ? "grey" : ""}>
              {text}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "stage_status",
      render: (text, record) => {
        let label = "";
        if (text === "STATUS") {
          label = text;
        } else {
          label =
            record.key && record.stage_status === "SUB"
              ? `[${record.stage_status_hash[text]}]` || "N/A"
              : "[Not submitted]";
        }
        return (
          <div title="Stage Status">
            {!(record.stage.isOptional || record.stage.isTitle) ? (
              <b className="uppercase">{label}</b>
            ) : (
              <div className={record.stage.isOptional && !record.stage.isTitle ? "grey" : ""}>
                {label}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "stage",
      align: "right",
      render: (text, record) => record?.link,
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
