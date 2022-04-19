import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider } from "antd";
import moment from "moment";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  fetchNoticesOfDeparture
} from "@common/actionCreators/noticeOfDepartureActionCreator";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import { getNoticesOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import * as Strings from "@common/constants/strings";
import MineNoticeOfDepartureTable from "./MineNoticeOfDepartureTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import AddButton from "@/components/common/buttons/AddButton";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired
};

export class MineNoticeOfDeparture extends Component {
  state = {
    isLoaded: false,
  };

  componentDidMount() {
    this.handleFetchNoticesOfDeparture();
  }

  handleFetchNoticesOfDeparture = () => {
    this.props
      .fetchNoticesOfDeparture(this.props.mineGuid)
      .then(() => this.handleFetchPermits());
  };

  handleFetchPermits = () => {
    this.props
      .fetchPermits(this.props.mineGuid)
      .then(() => this.setState({ isLoaded: true }));
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
        isApplication
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
  nods: getNoticesOfDeparture(state)
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticesOfDeparture,
      openModal,
      closeModal,
      fetchPermits
    },
    dispatch
  );

  MineNoticeOfDeparture.propTypes = propTypes;


export default AuthorizationGuard(Permission.IN_TESTING)(
  connect(mapStateToProps, mapDispatchToProps)(MineNoticeOfDeparture);
);
