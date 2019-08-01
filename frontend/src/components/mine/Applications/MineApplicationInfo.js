import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Icon, Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
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

/**
 * @class  MineApplicationInfo - contains all application information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
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
  componentWillMount() {}

  closeApplicationModal = () => {
    this.props.closeModal();
    this.props.fetchApplications({ mine_guid: this.props.mine.mine_guid });
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
    const payload = { mine_guid: this.props.mine.mine_guid, ...values };
    return this.props.createApplication(payload).then(this.closeApplicationModal);
  };

  handleEditApplication = (values) =>
    this.props.updateApplication(values.application_guid, values).then(this.closeApplicationModal);

  render() {
    return [
      <div>
        <div className="inline-flex between">
          <div />
          <div className="inline-flex between">
            <AuthorizationWrapper
              permission={Permission.EDIT_PERMITS}
              isMajorMine={this.props.mine.major_mine_ind}
            >
              <Button
                type="primary"
                onClick={(event) =>
                  this.openAddApplicationModal(
                    event,
                    `${ModalContent.ADD_APPLICATION} to ${this.props.mine.mine_name}`
                  )
                }
              >
                <Icon type="plus" theme="outlined" style={{ fontSize: "18px" }} />
                Add a New Application
              </Button>
            </AuthorizationWrapper>
          </div>
        </div>
      </div>,
      <br />,
      <MineApplicationTable
        applications={this.props.applications}
        isMajorMine={this.props.mine.major_mine_ind}
        openEditApplicationModal={this.openEditApplicationModal}
      />,
    ];
  }
}

const mapStateToProps = (state) => ({
  applications: getApplications(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplications,
      updateApplication,
      createApplication,
    },
    dispatch
  );

MineApplicationInfo.propTypes = propTypes;
MineApplicationInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineApplicationInfo);
