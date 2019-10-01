import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Icon, Button, Divider } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { openModal, closeModal } from "@/actions/modalActions";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import MineApplicationTable from "@/components/mine/Applications/MineApplicationTable";
import { getApplications } from "@/selectors/applicationSelectors";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import {
  fetchApplications,
  updateApplication,
  createApplication,
} from "@/actionCreators/applicationActionCreator";
import { getMines, getMineGuid } from "@/selectors/mineSelectors";

/**
 * @class  MineApplicationInfo - contains all application information
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  applications: PropTypes.arrayOf(CustomPropTypes.application),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchApplications: PropTypes.func.isRequired,
  updateApplication: PropTypes.func.isRequired,
  createApplication: PropTypes.func.isRequired,
};

const defaultProps = {
  applications: [],
};

export class MineApplicationInfo extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchApplications(this.props.mineGuid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  closeApplicationModal = () => {
    this.props.closeModal();
    this.props.fetchApplications(this.props.mineGuid).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  openAddApplicationModal = (event, title) => {
    event.preventDefault();

    this.props.openModal({
      props: {
        onSubmit: this.handleAddApplication,
        title,
      },
      content: modalConfig.ADD_APPLICATION,
    });
  };

  openEditApplicationModal = (event, application) => {
    event.preventDefault();

    const initialValues = { ...application };

    this.props.openModal({
      props: {
        initialValues,
        onSubmit: this.handleEditApplication,
        title: `Edit application for ${application.application_no}`,
      },
      content: modalConfig.EDIT_APPLICATION,
    });
  };

  handleAddApplication = (values) => {
    return this.props
      .createApplication(this.props.mineGuid, values)
      .then(this.closeApplicationModal);
  };

  handleEditApplication = (values) =>
    this.props
      .updateApplication(this.props.mineGuid, values.application_guid, values)
      .then(this.closeApplicationModal);

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Permit Applications</h2>
          <Divider />
        </div>
        <div className="right">
          <AuthorizationWrapper
            permission={Permission.EDIT_PERMITS}
            isMajorMine={mine.major_mine_ind}
          >
            <Button
              type="primary"
              onClick={(event) =>
                this.openAddApplicationModal(
                  event,
                  `${ModalContent.ADD_APPLICATION} to ${mine.mine_name}`
                )
              }
            >
              <Icon type="plus" theme="outlined" style={{ fontSize: "18px" }} />
              Add a New Application
            </Button>
          </AuthorizationWrapper>
        </div>
        <br />
        <MineApplicationTable
          isLoaded={this.state.isLoaded}
          applications={this.props.applications}
          isMajorMine={mine.major_mine_ind}
          openEditApplicationModal={this.openEditApplicationModal}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  applications: getApplications(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplications,
      updateApplication,
      createApplication,
      openModal,
      closeModal,
    },
    dispatch
  );

MineApplicationInfo.propTypes = propTypes;
MineApplicationInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineApplicationInfo);
