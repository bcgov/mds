import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

import * as Permission from "@/constants/permissions";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import AddButton from "@/components/common/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

import { fetchMineIncidents, createMineIncident } from "@/actionCreators/mineActionCreator";
import { getMineIncidents } from "@/selectors/mineSelectors";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineIncidents: PropTypes.arrayOf(CustomPropTypes.incident),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchMineIncidents: PropTypes.func.isRequired,
  createMineIncident: PropTypes.func.isRequired,
};

const defaultProps = {
  mineIncidents: [],
};

export class MineIncidents extends Component {
  componentDidMount() {
    this.props.fetchMineIncidents(this.props.mine.guid);
  }

  handleAddMineIncident = (values) =>
    this.props.createMineIncident(this.props.mine.guid, values).then(() => {
      this.props.closeModal();
      this.props.fetchMineIncidents(this.props.mine.guid);
    });

  openMineIncidentModal(event) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddMineIncident,
        title: ModalContent.ADD_INCIDENT(this.props.mine.mine_name),
        mineGuid: this.props.mine.guid,
      },
      widthSize: "25vw",
      content: modalConfig.MINE_INCIDENT,
    });
  }

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.CREATE}>
            <AddButton onClick={(event) => this.openMineIncidentModal(event)}>
              Record a Mine Incident
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <div>Num of incidents: {this.props.mineIncidents.length}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineIncidents: getMineIncidents(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineIncidents,
      createMineIncident,
    },
    dispatch
  );

MineIncidents.propTypes = propTypes;
MineIncidents.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineIncidents);
