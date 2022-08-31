import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Col, Row } from "antd";
import { uniqBy, flattenDeep } from "lodash";
import * as Strings from "@common/constants/strings";
import { formatDate } from "@common/utils/helpers";
import CoreTable from "@/components/common/CoreTable";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";

const propTypes = {
  projects: PropTypes.arrayOf(CustomPropTypes.project).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  statusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  handleSearch: PropTypes.func.isRequired,
  filters: PropTypes.objectOf(PropTypes.any),
  isLoaded: PropTypes.bool,
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
};

const defaultProps = {
  filters: {},
  isLoaded: false,
  sortField: undefined,
  sortDir: undefined,
};

const transformRowData = (projects, mineCommodityHash) =>
  projects?.map((project) => ({
    key: project.project_guid,
    project_title: project.project_title,
    project_id: project.project_id,
    mrc_review_required: project.mrc_review_required ? "Yes" : "No",
    project_stage: project.stage,
    status_code: project.status_code,
    guid: project.guid,
    contact: project.contacts
      .filter((contact) => contact.is_primary)
      .map((contact) => contact.name)[0],
    commodity:
      project.mine.mine_type && project.mine.mine_type.length > 0
        ? uniqBy(
            flattenDeep(
              project.mine.mine_type.reduce((result, type) => {
                if (type.mine_type_detail && type.mine_type_detail.length > 0) {
                  result.push(
                    type.mine_type_detail
                      .filter((detail) => detail.mine_commodity_code)
                      .map((detail) =>
                        mineCommodityHash ? mineCommodityHash[detail.mine_commodity_code] : ""
                      )
                  );
                }
                return result;
              }, [])
            )
          )
        : [],
    update_timestamp: formatDate(project.update_timestamp),
  }));

const handleTableChange = (handleSearch, tableFilters) => (pagination, filters, sorter) => {
  const params = {
    ...tableFilters,
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : undefined,
  };
  handleSearch(params);
};

const linkStage = (record) => {
  if (record.project_stage === "Project Summary") {
    return (
      <Link to={router.PRE_APPLICATIONS.dynamicRoute(record.key, record.guid)}>
        <Button type="primary">Open</Button>
      </Link>
    );
  }
  if (record.project_stage === "IRT") {
    return (
      <Link to={router.INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(record.key, record.guid)}>
        <Button type="primary">Open</Button>
      </Link>
    );
  }
  return (
    <Link to={router.MAJOR_MINE_APPLICATION.dynamicRoute(record.key, record.guid)}>
      <Button type="primary">Open</Button>
    </Link>
  );
};

export const MajorProjectTable = (props) => {
  const columns = [
    {
      key: "project_title",
      title: "Project Title",
      dataIndex: "project_title",
      sortField: "project_title",
      sorter: true,
      render: (text, record) => (
        <Link to={router.PROJECTS.dynamicRoute(record.key)} title="Name">
          {text}
        </Link>
      ),
    },
    {
      key: "project_id",
      title: "Project ID",
      dataIndex: "project_id",
      sortField: "project_id",
      sorter: true,
      render: (text) => <div title="Project ID">{text}</div>,
    },
    {
      key: "mrc_review_required",
      title: "MRC",
      dataIndex: "mrc_review_required",
      sortField: "mrc_review_required",
      sorter: false,
      render: (text) => <div title="MRC">{text}</div>,
    },
    {
      key: "project_stage",
      title: "Stage",
      dataIndex: "project_stage",
      sortField: "project_stage",
      sorter: false,
      render: (text) => <div title="Stage">{text}</div>,
    },
    {
      key: "status_code",
      title: "Review Status",
      dataIndex: "status_code",
      sortField: "status_code",
      sorter: false,
      render: (text) => (
        <div title="Review Status">{props.statusCodeHash[text] || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      key: "contact",
      title: "Primary Contact",
      dataIndex: "contact",
      sortField: "contact",
      sorter: false,
      render: (text) => <div title="Primary Contact">{text}</div>,
    },
    {
      key: "commodity",
      title: "Commodity",
      dataIndex: "commodity",
      sortField: "commodity",
      sorter: false,
      render: (text) => (
        <div title="Commodity">
          {(text && text.length > 0 && text.join(", ")) || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Updated Date",
      dataIndex: "update_timestamp",
      render: (text) => <div title="Updated Date">{text}</div>,
      sorter: false,
    },
    {
      title: "",
      dataIndex: "project",
      render: (text, record) => (
        <div title="" align="right">
          <Row gutter={1}>
            <Col span={12}>{linkStage(record)}</Col>
          </Row>
        </div>
      ),
    },
  ];

  const applySortIndicator = (_columns, field, dir) =>
    _columns.map((column) => ({
      ...column,
      sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
    }));

  return (
    <CoreTable
      condition={props.isLoaded}
      columns={applySortIndicator(columns, props.sortField, props.sortDir)}
      dataSource={transformRowData(props.projects?.records, props.mineCommodityOptionsHash)}
      tableProps={{
        align: "left",
        pagination: false,
        onChange: handleTableChange(props.handleSearch, props.filters),
      }}
    />
  );
};

MajorProjectTable.propTypes = propTypes;
MajorProjectTable.defaultProps = defaultProps;

export default MajorProjectTable;
