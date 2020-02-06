import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import PropTypes from "prop-types";
import {
  fetchPermits,
  createPermit,
  updatePermit,
  updatePermitAmendment,
  createPermitAmendment,
  removePermitAmendmentDocument,
} from "@common/actionCreators/permitActionCreator";
import { fetchPartyRelationships } from "@common/actionCreators/partiesActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getPermits } from "@common/reducers/permitReducer";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as router from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import AddButton from "@/components/common/AddButton";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const amalgamatedPermit = "ALG";
const originalPermit = "OGP";

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  fetchPartyRelationships: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  closeModal: PropTypes.func.isRequired,
  createPermit: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  updatePermit: PropTypes.func.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  createPermitAmendment: PropTypes.func.isRequired,
  removePermitAmendmentDocument: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MinePermitInfo extends Component {
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

  componentWillReceiveProps = (nextProps) => {
    if (this.state.modifiedPermits && nextProps.permits !== this.props.permits) {
      const currentPermits = this.props.permits
        .filter((p) => p.mine_guid === this.props.mineGuid)
        .map((x) => x.permit_guid);
      const nextPermits = nextProps.permits
        .filter((p) => p.mine_guid === this.props.mineGuid)
        .map((x) => x.permit_guid);

      this.setState((prevState) => ({
        expandedRowKeys: prevState.modifiedPermitGuid
          ? [prevState.modifiedPermitGuid]
          : nextPermits.filter((key) => currentPermits.indexOf(key) === -1),
        modifiedPermitGuid: null,
      }));
    }
  };

  closePermitModal = () => {
    this.props.closeModal();
    this.props.fetchMineRecordById(this.props.mineGuid);
    this.props.fetchPermits(this.props.mineGuid);
    this.props.fetchPartyRelationships({
      mine_guid: this.props.mineGuid,
      relationships: "party",
    });
  };

  // Permit Modals

  openAddPermitModal = (event, onSubmit, title) => {
    event.preventDefault();

    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: this.props.mineGuid,
        },
        onSubmit,
        title,
        mine_guid: this.props.mineGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_PERMIT,
    });
  };

  openEditPermitModal = (event, permit) => {
    event.preventDefault();

    this.props.openModal({
      props: {
        initialValues: permit,
        onSubmit: this.handleEditPermit,
        title: `Edit permit status for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_PERMIT,
    });
  };

  // Permit Handlers
  handleAddPermit = (values) => {
    const permit_no = values.permit_is_exploration
      ? `${values.permit_type}X-${values.permit_no}`
      : `${values.permit_type}-${values.permit_no}`;
    const payload = { ...values, permit_no };

    this.setState({ modifiedPermits: true });

    return this.props.createPermit(this.props.mineGuid, payload).then(this.closePermitModal);
  };

  handleEditPermit = (values) =>
    this.props
      .updatePermit(this.props.mineGuid, values.permit_guid, values)
      .then(this.closePermitModal);

  // Amendment Modals

  openAddAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: permit.mine_guid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.permit_amendments,
        },
        onSubmit,
        title,
        mine_guid: permit.mine_guid,
        amendments: permit.permit_amendments,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openEditAmendmentModal = (event, permit_amendment, permit) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          ...permit_amendment,
          amendments: permit.permit_amendments,
        },
        onSubmit: this.handleEditPermitAmendment,
        title:
          permit_amendment.permit_amendment_type_code === originalPermit
            ? `Edit initial permit for ${permit.permit_no}`
            : `Edit permit amendment for ${permit.permit_no}`,
        mine_guid: permit.mine_guid,
        isMajorMine: this.props.mines[this.props.mineGuid].major_mine_ind,
        permit_guid: permit.permit_guid,
        handleRemovePermitAmendmentDocument: this.handleRemovePermitAmendmentDocument,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openAddAmalgamatedPermitModal = (event, permit) =>
    this.openAddAmendmentModal(
      event,
      this.handleAddAmalgamatedPermit,
      `Add amalgamated permit to ${permit.permit_no}`,
      permit,
      amalgamatedPermit
    );

  openAddPermitAmendmentModal = (event, permit) =>
    this.openAddAmendmentModal(
      event,
      this.handleAddPermitAmendment,
      `Add permit amendment to ${permit.permit_no}`,
      permit
    );

  // Amendment Handlers

  handleEditPermitAmendment = (values) =>
    this.props
      .updatePermitAmendment(
        this.props.mineGuid,
        values.permit_guid,
        values.permit_amendment_guid,
        values
      )
      .then(this.closePermitModal);

  handleAddPermitAmendment = (values) => {
    this.setState({ modifiedPermits: true, modifiedPermitGuid: values.permit_guid });
    return this.props
      .createPermitAmendment(this.props.mineGuid, values.permit_guid, values)
      .then(this.closePermitModal);
  };

  handleAddAmalgamatedPermit = (values) => {
    this.setState({ modifiedPermits: true, modifiedPermitGuid: values.permit_guid });
    return this.props
      .createPermitAmendment(this.props.mineGuid, values.permit_guid, {
        ...values,
        permit_amendment_type_code: amalgamatedPermit,
      })
      .then(this.closePermitModal);
  };

  handleRemovePermitAmendmentDocument = (permitGuid, permitAmendmentGuid, documentGuid) =>
    this.props
      .removePermitAmendmentDocument(
        this.props.mineGuid,
        permitGuid,
        permitAmendmentGuid,
        documentGuid
      )
      .then(() => {
        this.props.fetchPermits(this.props.mineGuid);
      });

  handleAddPermitAmendmentApplication = (permitGuid) =>
    this.props.history.push(router.CREATE_NOTICE_OF_WORK_APPLICATION.route, {
      mineGuid: this.props.mineGuid,
      permitGuid,
    });

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => key !== record.key);
      return { expandedRowKeys };
    });

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Permits</h2>
          <Divider />
        </div>
        <div>
          <div className="inline-flex between">
            <div />
            <div className="inline-flex between">
              <AuthorizationWrapper
                permission={Permission.EDIT_PERMITS}
                isMajorMine={mine.major_mine_ind}
              >
                <AddButton
                  onClick={(event) =>
                    this.openAddPermitModal(
                      event,
                      this.handleAddPermit,
                      `${ModalContent.ADD_PERMIT} to ${mine.mine_name}`
                    )
                  }
                >
                  Add a New Permit
                </AddButton>
              </AuthorizationWrapper>
            </div>
          </div>
        </div>
        <br />
        <MinePermitTable
          isLoaded={this.state.isLoaded}
          permits={this.props.permits}
          partyRelationships={this.props.partyRelationships}
          major_mine_ind={mine.major_mine_ind}
          openEditPermitModal={this.openEditPermitModal}
          openEditAmendmentModal={this.openEditAmendmentModal}
          openAddPermitAmendmentModal={this.openAddPermitAmendmentModal}
          openAddAmalgamatedPermitModal={this.openAddAmalgamatedPermitModal}
          handleAddPermitAmendmentApplication={this.handleAddPermitAmendmentApplication}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpand={this.onExpand}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermits,
      createPermit,
      updatePermit,
      updatePermitAmendment,
      createPermitAmendment,
      removePermitAmendmentDocument,
      fetchPartyRelationships,
      fetchMineRecordById,
      openModal,
      closeModal,
    },
    dispatch
  );

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MinePermitInfo);
