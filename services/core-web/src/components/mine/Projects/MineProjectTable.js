import React from "react";
import { Button, Row, Col } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { getProjectSummaryStatusCodesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { formatDate, dateSorter } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  projects: PropTypes.arrayOf(CustomPropTypes.project).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const transformRowData = (projects) => {
  return projects?.map((project) => {
    const contact = project?.contacts?.find((c) => c.is_primary);

    return {
      key: project.project_guid,
      project,
      mine_guid: project.mine_guid,
      project_stage: project.project_summary?.status_code,
      project_id: project.project_id || Strings.EMPTY_FIELD,
      project_name: project.project_title,
      proponent_project_id: project.proponent_project_id || Strings.EMPTY_FIELD,
      project_contact: contact?.name || Strings.EMPTY_FIELD,
      project_lead_name: project.project_lead_name,
      last_updated_date: formatDate(project.update_timestamp),
    };
  });
};

export const MineProjectTable = (props) => {
  const columns = [
    {
      key: "project_name",
      title: "Project name",
      dataIndex: "project_name",
      render: (text) => <div title="Project name">{text}</div>,
    },
    {
      key: "proponent_project_id",
      title: "Project ID",
      dataIndex: "proponent_project_id",
      render: (text) => <div title="Project ID">{text}</div>,
    },
    {
      key: "project_lead_name",
      title: "EMLI Project Lead",
      dataIndex: "project_lead_name",
      render: (text) => <div title="EMLI Project Lead">{text}</div>,
    },
    {
      key: "project_contact",
      title: "Proponent contact",
      dataIndex: "project_contact",
      render: (text) => <div title="Proponent contact">{text}</div>,
    },
    {
      key: "project_stage",
      title: "Overall Project stage",
      dataIndex: "project_stage",
      render: (text) => (
        <div title="Overall Project stage">
          {props.projectSummaryStatusCodesHash[text] || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      key: "last_updated_date",
      title: "Last Submission date",
      dataIndex: "last_updated_date",
      render: (text) => <div title="Last updated date">{text}</div>,
      sorter: dateSorter("last_updated_date"),
      defaultSortOrder: "descend",
    },
    {
      title: "",
      dataIndex: "project",
      render: (text, record) => (
        <div title="" align="right">
          <Row gutter={1}>
            <Col span={12}>
              <Link to={router.PROJECTS.dynamicRoute(record.key)}>
                <Button type="primary">Open</Button>
              </Link>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <CoreTable
      condition={props.isLoaded}
      columns={columns}
      dataSource={transformRowData(props.projects)}
    />
  );
};

MineProjectTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
});

export default connect(mapStateToProps)(MineProjectTable);
