import React, { Component } from "react";
import { Button, Col, Row, Typography } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { closeModal, openModal } from "@common/actions/modalActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { destroy } from "redux-form";
import NoticeOfDepartureTable from "@/components/dashboard/mine/nods/NoticeOfDepartureTable";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfDeparture: PropTypes.func.isRequired,
};

// eslint-disable-next-line react/prefer-stateless-function
export class NoticesOfDeparture extends Component {
  state = { isLoaded: false };

  handleCreateNoticeOfDeparture = (values) => {
    this.setState({ isLoaded: false });
    return this.props.createNoticeOfDeparture(this.props.mine.mine_guid, values).then(() => {
      this.props.closeModal();
      this.handleFetchIncidents();
    });
  };

  openCreateNODModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          status_code: "PRE",
          determination_type_code: "PEN",
        },
        onSubmit: this.handleCreateNoticeOfDeparture,
        afterClose: this.handleCancelNoticeOfDeparture,
        title: "Create a Notice of Departure",
        mineGuid: this.props.mine.mine_guid,
      },
      content: modalConfig.ADD_NOTICE_OF_DEPARTURE,
    });
  };

  render() {
    return (
      <Row>
        <Col span={24}>
          {/* TODO: Add authorization wrapper */}
          <Button
            style={{ display: "inline", float: "right" }}
            type="primary"
            onClick={(event) => this.openCreateNODModal(event)}
          >
            <PlusCircleFilled />
            Create a Notice of Departure
          </Button>
          <Typography.Title level={4}>Notices of Departure</Typography.Title>
          <Typography.Paragraph>
            The below table displays all of the&nbsp; notices of departure and their associated
            permits &nbsp;associated with this mine.
          </Typography.Paragraph>
          <NoticeOfDepartureTable isLoaded={this.state.isLoaded} />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      destroy,
      openModal,
      closeModal,
    },
    dispatch
  );

NoticesOfDeparture.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NoticesOfDeparture);
