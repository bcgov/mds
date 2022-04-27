import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { closeModal, openModal } from "@common/actions/modalActions";
import { fetchNoticesOfDeparture } from "@common/actionCreators/noticeOfDepartureActionCreator";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import { getNoticesOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import MineNoticeOfDepartureTable from "./MineNoticeOfDepartureTable";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  nods: PropTypes.arrayOf(CustomPropTypes.noticeOfDeparture).isRequired,
  openModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
};

export class MineNoticeOfDeparture extends Component {
  state = {
    isLoaded: false,
  };

  componentDidMount() {
    this.handleFetchNoticesOfDeparture();
  }

  handleFetchNoticesOfDeparture = () => {
    this.props.fetchNoticesOfDeparture(this.props.mineGuid).then(() => this.handleFetchPermits());
  };

  handleFetchPermits = () => {
    this.props.fetchPermits(this.props.mineGuid).then(() => this.setState({ isLoaded: true }));
  };

  openNoticeOfDepartureModal = (event, noticeOfDeparture) => {
    event.preventDefault();
    const title = "View Notice of Departure";
    this.props.openModal({
      props: {
        noticeOfDeparture,
        title,
        clearOnSubmit: true,
      },
      width: "50vw",
      content: modalConfig.VIEW_NOTICE_OF_DEPARTURE_MODAL,
    });
  };

  renderNoticeOfDepartureTables = (mine) => (
    <div>
      <br />
      <h4 className="uppercase">Notices of Departure</h4>
      <br />
      <MineNoticeOfDepartureTable
        isLoaded={this.state.isLoaded}
        nods={this.props.nods}
        mine={mine}
        openViewNodModal={this.openNoticeOfDepartureModal}
      />
      <br />
    </div>
  );

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Notices Of Departure</h2>
          <Divider />
        </div>
        {this.renderNoticeOfDepartureTables(mine)}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  nods: getNoticesOfDeparture(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticesOfDeparture,
      openModal,
      closeModal,
      fetchPermits,
    },
    dispatch
  );

MineNoticeOfDeparture.propTypes = propTypes;

export default AuthorizationGuard(Permission.IN_TESTING)(
  connect(mapStateToProps, mapDispatchToProps)(MineNoticeOfDeparture)
);
