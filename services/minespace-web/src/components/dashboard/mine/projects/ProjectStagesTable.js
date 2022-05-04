import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Table, Row, Col, Button } from "antd";
import { formatDate } from "@/utils/helpers";
import * as routes from "@/constants/routes";

const propTypes = {};

export class ProjectStagesTable extends Component {
  transformRowData = (projectStages) =>
    projectStages &&
    projectStages.map((stage) => ({
      key: stage.key,
      project_stage: stage.title,
      stage_status: stage.status,
      stage,
    }));

  columns = () => [
    {
      title: "",
      dataIndex: "project_stage",
      render: (text) => <div title="Project Stage">{text}</div>,
    },
    {
      title: "",
      dataIndex: "stage_status",
      render: (text) => <div title="Stage Status">{text || "N/A"}</div>,
    },
    {
      title: "",
      dataIndex: "stage",
      render: (text, record) => (
        <Button className="full-mobile margin-small" type="secondary">
          Edit
        </Button>
      ),
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
