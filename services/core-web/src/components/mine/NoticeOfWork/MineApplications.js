import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider, Tabs } from "antd";
import PropTypes from "prop-types";
import queryString from "query-string";
import { getMineRegionHash } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  fetchMineNoticeOfWorkApplications,
  createAdminAmendmentApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { getExplosivesPermits } from "@mds/common/redux/selectors/explosivesPermitSelectors";
import { getNoticeOfWorkList } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import { formatQueryListParams } from "@common/utils/helpers";
import * as router from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/buttons/AddButton";
import CustomPropTypes from "@/customPropTypes";
import MineNoticeOfWorkTable from "@/components/mine/NoticeOfWork/MineNoticeOfWorkTable";
import MineAdministrativeAmendmentTable from "@/components/mine/AdministrativeAmendment/MineAdministrativeAmendmentTable";
import ExplosivesPermit from "@/components/mine/ExplosivesPermit/ExplosivesPermit";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  fetchMineNoticeOfWorkApplications: PropTypes.func.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createAdminAmendmentApplication: PropTypes.func.isRequired,
  explosivesPermits: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export class MineApplications extends Component {
  params = queryString.parse(this.props.location.search);

  listQueryParams = [];

  splitListParams = formatQueryListParams("split", this.listQueryParams);

  state = {
    isLoaded: false,
    params: {
      ...this.params,
    },
  };

  componentDidMount() {
    const params = this.props.location.search;
    const parsedParams = queryString.parse(params);
    const { page = this.state.params.page, per_page = this.state.params.per_page } = parsedParams;
    if (params) {
      this.renderDataFromURL();
    } else {
      this.props.history.replace(
        router.MINE_NOW_APPLICATIONS.dynamicRoute(this.props.mineGuid, {
          page,
          per_page,
        })
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      this.renderDataFromURL(nextProps.location.search);
    }
  }

  renderDataFromURL = (queryParams) => {
    const params = queryParams || this.props.location.search;
    const parsedParams = queryString.parse(params);
    this.setState(
      {
        params: this.splitListParams(parsedParams),
        isLoaded: false,
      },
      () =>
        this.props
          .fetchMineNoticeOfWorkApplications({ mine_guid: this.props.mineGuid, ...parsedParams })
          .then(() => {
            this.setState({ isLoaded: true });
          })
    );
  };

  handleSearch = (searchParams = {}, clear = false) => {
    const persistedParams = clear ? {} : this.state.params;
    const updatedParams = {
      // Start from existing state
      ...persistedParams,
      // Overwrite prev params with any newly provided search params
      ...searchParams,
    };

    this.props.history.replace(
      router.MINE_NOW_APPLICATIONS.dynamicRoute(this.props.mineGuid, updatedParams)
    );
  };

  handleAddAdminAmendment = (values) => {
    const payload = {
      mine_guid: this.props.mineGuid,
      ...values,
    };
    return this.props
      .createAdminAmendmentApplication(payload)
      .then(() => {
        this.renderDataFromURL(this.props.location.search);
      })
      .finally(() => {
        this.props.closeModal();
      });
  };

  handleOpenAddAdminAmendmentModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddAdminAmendment,
        title: "Add Administrative Amendment ",
      },
      content: modalConfig.ADD_ADMIN_AMENDMENT_MODAL,
    });
  };

  render() {
    return (
      <div className="tab__content">
        <h2>Applications</h2>
        <Divider />
        <Tabs type="card" style={{ textAlign: "left !important" }}>
          <Tabs.TabPane
            tab={`Notice of Work (${
              this.props.noticeOfWorkApplications.filter(
                (app) => app.application_type_code === "NOW"
              ).length
            })`}
            key="1"
          >
            <>
              <br />
              <div className="inline-flex between">
                <h4 className="uppercase">Notice of Work Applications</h4>
              </div>
              <MineNoticeOfWorkTable
                isLoaded={this.state.isLoaded}
                handleSearch={this.handleSearch}
                noticeOfWorkApplications={this.props.noticeOfWorkApplications.filter(
                  (app) => app.application_type_code === "NOW"
                )}
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
                searchParams={this.state.params}
                mineRegionHash={this.props.mineRegionHash}
              />
            </>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={`Administrative Amendments (${
              this.props.noticeOfWorkApplications.filter(
                (app) => app.application_type_code === "ADA"
              ).length
            })`}
            key="2"
          >
            <>
              <br />
              <div className="inline-flex between">
                <h4 className="uppercase">Administrative Amendments</h4>
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <AddButton onClick={(e) => this.handleOpenAddAdminAmendmentModal(e)}>
                    Add Administrative Amendment
                  </AddButton>
                </AuthorizationWrapper>
              </div>
              <MineAdministrativeAmendmentTable
                isLoaded={this.state.isLoaded}
                handleSearch={this.handleSearch}
                administrativeAmendmentApplications={this.props.noticeOfWorkApplications.filter(
                  (app) => app.application_type_code === "ADA"
                )}
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
                searchParams={this.state.params}
                mineRegionHash={this.props.mineRegionHash}
              />
            </>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={`Explosives Storage & Use Permit Applications (${this.props.explosivesPermits.length})`}
            key="3"
          >
            <>
              <ExplosivesPermit />
            </>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  mineRegionHash: getMineRegionHash(state),
  explosivesPermits: getExplosivesPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNoticeOfWorkApplications,
      openModal,
      closeModal,
      createAdminAmendmentApplication,
    },
    dispatch
  );

MineApplications.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineApplications);
