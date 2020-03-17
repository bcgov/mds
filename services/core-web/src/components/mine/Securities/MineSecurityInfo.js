/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import PropTypes from "prop-types";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getPermits } from "@common/reducers/permitReducer";
import {
  fetchMineBonds,
  fetchMineBondsById,
  createBond,
  updateBond,
} from "@common/actionCreators/securitiesActionCreator";
import { getMineGuid } from "@common/selectors/mineSelectors";
import CustomPropTypes from "@/customPropTypes";
import MineBondTable from "@/components/mine/Securities/MineBondTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
/**
 * @class  MineSecurityInfo - contains all information relating to bonds and securities
 */

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  openModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchMineBonds: PropTypes.func.isRequired,
  fetchMineBondsById: PropTypes.func.isRequired,
  createBond: PropTypes.func.isRequired,
  updateBond: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MineSecurityInfo extends Component {
  state = {
    expandedRowKeys: [],
    modifiedPermits: false,
    modifiedPermitGuid: null,
    isLoaded: false,
  };

  componentWillMount = () => {
    const { id } = this.props.match.params;
    this.props.fetchPermits(id).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  openAddBondModal = (event, onSubmit, title) => {
    event.preventDefault();
    this.props.openModal({
      width: "50vw",
      content: modalConfig.ADD_PERMIT,
    });
  };

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => key !== record.key);
      return { expandedRowKeys };
    });

  render() {
    return (
      <div className="tab__content">
        <div>
          <h2>Securities</h2>
          <Divider />
        </div>
        <br />
        <MineBondTable
          isLoaded={this.state.isLoaded}
          permits={this.props.permits}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpand={this.onExpand}
          openAddBondModal={this.openAddBondModal}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  mineGuid: getMineGuid(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermits,
      fetchMineRecordById,
      openModal,
      closeModal,
      fetchMineBonds,
      fetchMineBondsById,
      createBond,
      updateBond,
    },
    dispatch
  );

MineSecurityInfo.propTypes = propTypes;
MineSecurityInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineSecurityInfo);
