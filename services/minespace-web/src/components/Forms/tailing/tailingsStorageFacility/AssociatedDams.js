import { ADD_DAM, EDIT_DAM } from "@/constants/routes";
import { Button, Col, Row, Space, Table, Typography } from "antd";
import {
  CONSEQUENCE_CLASSIFICATION_CODE_HASH,
  DAM_OPERATING_STATUS_HASH,
} from "@common/constants/strings";
import { bindActionCreators, compose } from "redux";

import { EditIcon } from "@/assets/icons";
import { PlusCircleFilled } from "@ant-design/icons";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { getTsf } from "@common/reducers/tailingsReducer";
import { storeDam } from "@common/actions/damActions";
import { useHistory } from "react-router-dom";

const propTypes = {
  tsf: PropTypes.objectOf(PropTypes.any).isRequired,
  storeDam: PropTypes.func.isRequired,
};

const AssociatedDams = (props) => {
  const history = useHistory();
  const { tsf } = props;

  const handleNavigateToEdit = (event, dam) => {
    event.preventDefault();
    props.storeDam(dam);
    const url = EDIT_DAM.dynamicRoute(dam.mine_tailings_storage_facility_guid, dam.dam_guid);
    history.push(url);
  };

  const handleNavigateToCreate = () => {
    const url = ADD_DAM.dynamicRoute(tsf.mine_tailings_storage_facility_guid);
    history.push(url);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "dam_name",
      key: "dam_name",
    },
    {
      title: "Operating Status",
      dataIndex: "operating_status",
      key: "operating_status",
      render: (text) => <Typography.Text>{DAM_OPERATING_STATUS_HASH[text]}</Typography.Text>,
    },
    {
      title: "Consequence Classification",
      dataIndex: "consequence_classification",
      key: "consequence_classification",
      render: (text) => (
        <Typography.Text>{CONSEQUENCE_CLASSIFICATION_CODE_HASH[text]}</Typography.Text>
      ),
    },
    {
      title: "Permitted Crest Elevation",
      dataIndex: "permitted_dam_crest_elevation",
      key: "permitted_dam_crest_elevation",
    },
    {
      title: "Current Height",
      dataIndex: "current_dam_height",
      key: "current_dam_height",
    },
    {
      title: "Current Elavation",
      dataIndex: "current_elevation",
      key: "current_elevation",
    },
    {
      title: "Max Pond Elevation",
      dataIndex: "max_pond_elevation",
      key: "max_pond_elevation",
    },
    {
      title: "Actions",
      key: "actions",
      dataIndex: "actions",
      // eslint-disable-next-line react/display-name
      render: (text, record) => (
        <Space size="middle">
          <div className="inline-flex">
            <Button type="primary" size="small" ghost>
              <EditIcon
                onClick={(event) => handleNavigateToEdit(event, record)}
                className="icon-xs--darkestgrey"
              />
            </Button>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title level={3} className="gov-blue-title">
            Associated Dams
          </Typography.Title>
          <Typography.Text>
            Dams related to {tsf.mine_tailings_storage_facility_name}
          </Typography.Text>
        </Col>
        <Col>
          <Button type="primary" onClick={handleNavigateToCreate}>
            <PlusCircleFilled />
            Create a new dam
          </Button>
        </Col>
      </Row>
      <Table columns={columns} dataSource={tsf.dams} locale={{ emptyText: "No Data Yet" }} />
    </div>
  );
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ storeDam }, dispatch);

const mapStateToProps = (state) => ({
  tsf: getTsf(state),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(AssociatedDams);
