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
      render: (text) => (
        <div title="Project Stage">
          <b>{text}</b>
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "stage_status",
      render: (text, record) => (
        <div title="Stage Status">
          <b>{`[${record.stage_status_hash[text]}]` || "N/A"}</b>
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "stage",
      align: "right",
      render: (text, record) => record.link,
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
