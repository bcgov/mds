import React, { Component } from "react";
import { Button, Col, Row, Typography } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { closeModal, openModal } from "@common/actions/modalActions";
import {
  createNoticeOfDeparture,
  fetchNoticesOfDeparture,
} from "@common/actionCreators/noticeOfDepartureActionCreator";
import { getNoticesOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { destroy } from "redux-form";
import { getPermits } from "@common/selectors/permitSelectors";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import NoticeOfDepartureTable from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureTable";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  nods: PropTypes.arrayOf(CustomPropTypes.noticeOfDeparture).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfDeparture: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {};

// eslint-disable-next-line react/prefer-stateless-function
export class NoticeOfDeparture extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.handleFetchNoticesOfDeparture();
  }

  handleFetchNoticesOfDeparture = () => {
    this.props
      .fetchNoticesOfDeparture(this.props.mine.mine_guid)
      .then(() => this.handleFetchPermits());
  };

  handleFetchPermits = () => {
    this.props
      .fetchPermits(this.props.mine.mine_guid)
      .then(() => this.setState({ isLoaded: true }));
  };

  handleCreateNoticeOfDeparture = (permit_guid, values) => {
    this.setState({ isLoaded: false });
    return this.props
      .createNoticeOfDeparture(this.props.mine.mine_guid, permit_guid, values)
      .then(() => {
        this.props.closeModal();
        this.handleFetchNoticesOfDeparture();
      });
  };

  openCreateNODModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleCreateNoticeOfDeparture,
        afterClose: this.handleCancelNoticeOfDeparture,
        title: "Create a Notice of Departure",
        mineGuid: this.props.mine.mine_guid,
        permits: this.props.permits,
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
          <NoticeOfDepartureTable isLoaded={this.state.isLoaded} data={this.props.nods} />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  nods: getNoticesOfDeparture(state),
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      destroy,
      openModal,
      closeModal,
      createNoticeOfDeparture,
      fetchNoticesOfDeparture,
      fetchPermits,
    },
    dispatch
  );

NoticeOfDeparture.propTypes = propTypes;
NoticeOfDeparture.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NoticeOfDeparture);
