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
import { renderCategoryColumn, renderTextColumn } from "@/components/common/CoreTableCommonColumns";

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
    mine_name: project.mine?.mine_name,
    project_stage: project.stage,
    status_code: project.status_code,
    guid: project.guid,
    name: project.contacts
      .filter((contact) => contact.is_primary)
      .map((contact) => contact.name)[0],
    project_lead_name: project.project_lead_name,
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
    renderTextColumn("project_id", "Project ID", true),
    renderTextColumn("mine_name", "Mine Name", true),
    renderTextColumn("mrc_review_required", "MRC", true),
    renderTextColumn("project_stage", "Stage"),
    renderCategoryColumn(
      "status_code",
      "Review Status",
      props.statusCodeHash,
      false,
      Strings.EMPTY_FIELD
    ),
    renderTextColumn("project_lead_name", "EMLI Project Lead", true),
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
      key: "update_timestamp",
      dataIndex: "update_timestamp",
      render: (text) => <div title="Updated Date">{text}</div>,
      sorter: false,
    },
    {
      title: "",
      key: "project",
      dataIndex: "project",
      render: (text, record) => (
        <div title="" align="right" data-cy="major-projects-table-open-button">
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

  const applySortIndicator = (_columns, field, dir) =>
    _columns.map((column) => ({
      ...column,
      sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
    }));

  return (
    <CoreTable
      condition={props.isLoaded}
      columns={applySortIndicator(columns, props.sortField, props.sortDir)}
      dataSource={transformRowData(props.projects, props.mineCommodityOptionsHash)}
      onChange={handleTableChange(props.handleSearch, props.filters)}
    />
  );
};

MajorProjectTable.propTypes = propTypes;
MajorProjectTable.defaultProps = defaultProps;

export default MajorProjectTable;
