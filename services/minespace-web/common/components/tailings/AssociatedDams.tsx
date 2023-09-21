import { Button, Col, Row, Space, Typography } from "antd";
import {
  CONSEQUENCE_CLASSIFICATION_CODE_HASH,
  DAM_OPERATING_STATUS_HASH,
} from "@common/constants/strings";
import { bindActionCreators, compose } from "redux";

import { PlusCircleFilled } from "@ant-design/icons";
import React, { FC } from "react";
import { connect } from "react-redux";
import { getTsf } from "@common/reducers/tailingsReducer";
import moment from "moment";
import { storeDam } from "@common/actions/damActions";
import { useHistory } from "react-router-dom";
import { EditIcon } from "@/assets/icons";
import { ADD_DAM, EDIT_DAM } from "@/constants/routes";
import { IDam, INoticeOfDeparture } from "@mds/common";
import { RootState } from "@/App";
import { ColumnsType } from "antd/lib/table";
import CoreTable from "@/components/common/CoreTable";

interface AssociatedDamsProps {
  tsf: INoticeOfDeparture;
  storeDam: typeof storeDam;
  isCore?: boolean;
}

const AssociatedDams: FC<AssociatedDamsProps> = (props) => {
  const history = useHistory();
  const { tsf, isCore } = props;

  const handleNavigateToEdit = (event, dam) => {
    event.preventDefault();
    props.storeDam(dam);
    const url = EDIT_DAM.dynamicRoute(
      tsf.mine_guid,
      dam.mine_tailings_storage_facility_guid,
      dam.dam_guid
    );
    history.push(url);
  };

  const handleNavigateToCreate = () => {
    props.storeDam({});
    const url = ADD_DAM.dynamicRoute(tsf.mine_guid, tsf.mine_tailings_storage_facility_guid);
    history.push(url);
  };

  const columns: ColumnsType<IDam> = [
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
      render: (record) => (
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

  const mostRecentUpdatedDate = moment(
    Math.max.apply(
      null,
      tsf.dams.map((dam) => moment(dam.update_timestamp))
    )
  ).format("DD-MM-YYYY H:mm");

  return (
    <div>
      <Row justify="space-between" align="middle" className="associated-dams-header">
        <Col>
          <Typography.Title level={4} className="gov-blue-title">
            Associated Dams
          </Typography.Title>
          <Typography.Text>
            Dams related to {tsf.mine_tailings_storage_facility_name}
          </Typography.Text>
        </Col>
        <Col>
          {isCore ? (
            <div>
              <Typography.Paragraph strong style={{ textAlign: "right" }}>
                Last Updated
              </Typography.Paragraph>
              <Typography.Paragraph>{mostRecentUpdatedDate}</Typography.Paragraph>
            </div>
          ) : (
            <Button type="primary" onClick={handleNavigateToCreate}>
              <PlusCircleFilled />
              Create a new dam
            </Button>
          )}
        </Col>
      </Row>
      <CoreTable columns={columns} dataSource={tsf.dams} />
    </div>
  );
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ storeDam }, dispatch);

const mapStateToProps = (state: RootState) => ({
  tsf: getTsf(state),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(AssociatedDams);
