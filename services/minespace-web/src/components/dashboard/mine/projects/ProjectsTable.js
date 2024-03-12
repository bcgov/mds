import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import { dateSorter } from "@common/utils/helpers";
import { formatDate } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import { EDIT_PENCIL } from "@/constants/assets";
import CoreTable from "@mds/common/components/common/CoreTable";

const propTypes = {
  projects: PropTypes.arrayOf(CustomPropTypes.project).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

export class ProjectsTable extends Component {
  transformRowData = (projects) =>
    projects &&
    projects.map((project) => {
      const primaryContact = project.contacts.find((c) => c.is_primary);
      const firstName = primaryContact?.first_name || "";
      const lastName = primaryContact?.last_name || "";
      return {
        key: project.project_guid,
        project,
        primary_contact: `${firstName} ${lastName}`,
        mine_guid: project.mine_guid,
        proponent_project_id: project.proponent_project_id,
        project_title: project.project_title,
        update_user: project.update_user,
        update_timestamp: formatDate(project.update_timestamp),
        documents: project.documents,
      };
    });

  columns = () => [
    {
      title: "Project Title",
      dataIndex: "project_title",
      sorter: (a, b) => (a.project_title > b.project_title ? -1 : 1),
      render: (text) => <div title="Project Name">{text}</div>,
    },
    {
      title: "Project #",
      dataIndex: "proponent_project_id",
      sorter: (a, b) => (a.proponent_project_id > b.proponent_project_id ? -1 : 1),
      render: (text) => <div title="Project #">{text || "N/A"}</div>,
    },
    {
      title: "Contact",
      dataIndex: "primary_contact",
      sorter: (a, b) => (a.primary_contact > b.primary_contact ? -1 : 1),
      render: (text) => <div title="Contact">{text}</div>,
    },
    {
      title: "Last Updated",
      dataIndex: "update_timestamp",
      sorter: dateSorter("update_timestamp"),
      render: (text) => <div title="Last Updated">{text}</div>,
    },
    {
      title: "Updated By",
      dataIndex: "update_user",
      render: (text) => <div title="Last Updated By">{text}</div>,
      sorter: (a, b) => (a.update_user > b.update_user ? -1 : 1),
    },
    {
      title: "",
      dataIndex: "project",
      render: (text, record) => (
        <div title="" align="right">
          <Row gutter={1}>
            <Col span={12}>
              <Link to={routes.EDIT_PROJECT.dynamicRoute(record.project.project_guid)}>
                <img src={EDIT_PENCIL} alt="Edit" />
              </Link>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  render() {
    return (
      <CoreTable
        loading={!this.props.isLoaded}
        columns={this.columns()}
        dataSource={this.transformRowData(this.props.projects)}
        emptyText="This mine has no project data."
      />
    );
  }
}

ProjectsTable.propTypes = propTypes;

export default ProjectsTable;
