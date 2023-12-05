import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import * as Strings from "@mds/common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@mds/common/components/common/CoreTable";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import NullScreen from "@/components/common/NullScreen";

/**
 * @class EPICAuthorizationsTable - list of the external authorizations on a mine
 */
const propTypes = {
  data: PropTypes.objectOf(CustomPropTypes.mineInfo),
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {
  data: {},
};

const transformRowData = (projectInfo) => {
  return (
    projectInfo &&
    projectInfo.map((project) => {
      return {
        ...project,
        key: project.project_id,
      };
    })
  );
};

export class EPICAuthorizationsTable extends Component {
  columns = [
    {
      title: "Legislation Year",
      dataIndex: "project_legislation_year",
      sortField: "project_legislation_year",
      render: (text) => <div title="Legislation Year">{text}</div>,
      sorter: false,
    },
    {
      title: "Project Lead",
      dataIndex: "project_lead",
      sortField: "project_lead",
      render: (text) => <div title="Project Lead">{text}</div>,
      sorter: false,
    },
    {
      title: "Project Lead Email",
      dataIndex: "project_lead_email",
      sortField: "project_lead_email",
      render: (text) => <div title="Project Lead Email">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Project Lead Phone",
      dataIndex: "project_lead_phone",
      sortField: "project_lead_phone",
      render: (text) => <div title="Project Lead Phone">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Responsible EPD",
      dataIndex: "responsible_EPD",
      sortField: "responsible_EPD",
      render: (text) => <div title="Responsible EPD">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Responsible EPD Email",
      dataIndex: "responsible_EPD_email",
      sortField: "responsible_EPD_email",
      render: (text) => <div title="Responsible EPD Email">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "Responsible EPD Phone",
      dataIndex: "responsible_EPD_phone",
      sortField: "responsible_EPD_phone",
      render: (text) => <div title="Responsible EPD Phone">{text || Strings.EMPTY_FIELD}</div>,
      sorter: false,
    },
    {
      title: "EPIC Link",
      dataIndex: "link",
      sortField: "link",
      render: (text) => (
        <div title="Responsible EPD Phone">
          <a href={text} target="_blank" rel="noopener noreferrer">
            Link to the project on EPIC
          </a>
        </div>
      ),
      sorter: false,
    },
  ];

  render() {
    return (
      <div>
        <div>
          <h4>Summary</h4>
          <LoadingWrapper condition={this.props.isLoaded}>
            {this.props.data?.mine_info && this.props.data?.mine_info.summary !== null ? (
              <span>{this.props.data?.mine_info?.summary}</span>
            ) : (
              <NullScreen type="epic-authorizations" />
            )}
          </LoadingWrapper>
        </div>
        <br />
        <CoreTable
          condition={this.props.isLoaded}
          dataSource={transformRowData(this.props.data?.mine_info?.projects)}
          columns={this.columns}
        />
      </div>
    );
  }
}

EPICAuthorizationsTable.propTypes = propTypes;
EPICAuthorizationsTable.defaultProps = defaultProps;

export default withRouter(EPICAuthorizationsTable);
