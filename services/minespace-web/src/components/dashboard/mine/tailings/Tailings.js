import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button } from "antd";
import PropTypes from "prop-types";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  fetchMineRecordById,
  updateTailingsStorageFacility,
} from "@common/actionCreators/mineActionCreator";
import { PlusCircleFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import * as routes from "@/constants/routes";
import { detectProdEnvironment as IN_PROD } from "@/utils/environmentUtils";
import TailingsTable from "./TailingsTable";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  updateTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

export const Tailings = (props) => {
  const handleEditTailings = (values) => {
    return props
      .updateTailingsStorageFacility(
        values.mine_guid,
        values.mine_tailings_storage_facility_guid,
        values
      )
      .then(() => props.closeModal())
      .then(() => props.fetchMineRecordById(values.mine_guid));
  };

  const openEditTailingsModal = (event, onSubmit, record) => {
    event.preventDefault();
    props.openModal({
      props: {
        initialValues: record,
        onSubmit,
        title: `Edit ${record.mine_tailings_storage_facility_name}`,
      },
      content: modalConfig.ADD_TAILINGS,
    });
  };

  return (
    <Row>
      <Col span={24}>
        <Row justify={!IN_PROD() ? "space-between" : "start"}>
          <Col>
            <Title level={4}>Tailing Storage Facilities</Title>
            <Paragraph>
              This table shows&nbsp;
              <Text className="color-primary" strong>
                Tailing Storage Facilities
              </Text>
              &nbsp;for your mine.
            </Paragraph>
            <br />
          </Col>
          {!IN_PROD() && (
            <Col>
              <Link to={routes.ADD_TAILINGS_STORAGE_FACILITY.dynamicRoute(props.mine.mine_guid)}>
                <Button type="primary">
                  <PlusCircleFilled />
                  Create New Facility
                </Button>
              </Link>
            </Col>
          )}
        </Row>
        <Row gutter={[16, 32]}>
          <Col span={24}>
            <TailingsTable
              tailings={props.mine.mine_tailings_storage_facilities}
              openEditTailingsModal={openEditTailingsModal}
              handleEditTailings={handleEditTailings}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

Tailings.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateTailingsStorageFacility,
      fetchMineRecordById,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(Tailings);
