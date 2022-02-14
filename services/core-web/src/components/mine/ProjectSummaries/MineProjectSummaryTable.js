import React from "react";
import { Button } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import { getProjectSummaryStatusCodesHash } from "@common/selectors/staticContentSelectors";
import { formatDate, dateSorter } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.projectSummary).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const transformRowData = (projectSummaries) => {
  return projectSummaries.map((projectSummary) => {
    const contact = projectSummary?.contacts?.find((c) => c.is_primary);

    return {
      key: projectSummary.project_summary_guid,
      projectSummary,
      mine_guid: projectSummary.mine_guid,
      project_stage: projectSummary.status_code,
      documents: projectSummary.documents,
      project_summary_id: projectSummary.project_summary_id || Strings.EMPTY_FIELD,
      project_name: projectSummary.project_summary_title,
      project_summary_lead_name: projectSummary.project_summary_lead_name || Strings.EMPTY_FIELD,
      project_proponent_id: projectSummary.proponent_project_id || Strings.EMPTY_FIELD,
      project_contact: contact?.name || Strings.EMPTY_FIELD,
      first_submitted_date: formatDate(projectSummary.submission_date) || Strings.EMPTY_FIELD,
      last_updated_date: formatDate(projectSummary.update_timestamp),
    };
  });
};

export const MineProjectSummaryTable = (props) => {
  const columns = [
    {
      key: "project_name",
      title: "Project name",
      dataIndex: "project_name",
      render: (text) => <div title="Project name">{text}</div>,
    },
    {
      key: "project_proponent_id",
      title: "Project Proponent ID",
      dataIndex: "project_proponent_id",
      render: (text) => <div title="Project Proponent ID">{text}</div>,
    },
    {
      key: "project_summary_lead_name",
      title: "EMLI Project Lead",
      dataIndex: "project_summary_lead_name",
      render: (text) => <div title="EMLI Project Lead">{text}</div>,
    },
    {
      key: "project_contact",
      title: "Project contact",
      dataIndex: "project_contact",
      render: (text) => <div title="Project contact">{text}</div>,
    },
    {
      key: "project_stage",
      title: "Project stage",
      dataIndex: "project_stage",
      render: (text) => (
        <div title="Project stage">
          {props.projectSummaryStatusCodesHash[text] || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      key: "first_submitted_date",
      title: "First submitted date",
      dataIndex: "first_submitted_date",
      render: (text) => <div title="First submitted date">{text}</div>,
      sorter: dateSorter("first_submitted_date"),
    },
    {
      key: "last_updated_date",
      title: "Last updated date",
      dataIndex: "last_updated_date",
      render: (text) => <div title="Last updated date">{text}</div>,
      sorter: dateSorter("last_updated_date"),
      sortOrder: "descend",
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
    {
      dataIndex: "projectSummary",
      render: (record) => (
        <div className="btn--middle flex">
          <Link
            to={router.PRE_APPLICATIONS.dynamicRoute(record.mine_guid, record.project_summary_guid)}
          >
            <Button type="primary">Open</Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <CoreTable
      condition={props.isLoaded}
      columns={columns}
      dataSource={transformRowData(props.projectSummaries)}
      tableProps={{
        align: "left",
      }}
    />
  );
};

MineProjectSummaryTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
});

export default connect(mapStateToProps)(MineProjectSummaryTable);
