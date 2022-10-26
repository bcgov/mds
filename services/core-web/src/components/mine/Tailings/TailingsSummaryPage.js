// import * as FORM from "@/constants/forms";
// import * as Permission from "@/constants/permissions";

import { Col, Divider, Row, Typography } from "antd";
import { Link, withRouter } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchPartyRelationships } from "@common/actionCreators/partiesActionCreator";

import { bindActionCreators, compose } from "redux";
import { storeTsf } from "@common/actions/tailingsActions";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { resetForm } from "@common/utils/helpers";
import { reduxForm, touch } from "redux-form";
import PropTypes from "prop-types";

import Step from "@common/components/Step";
import SteppedForm from "@common/components/SteppedForm";
import { connect } from "react-redux";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { getTsf } from "@common/selectors/tailingsSelectors";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import BasicInformation from "@common/components/tailings/BasicInformation";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { renderConfig } from "@/components/common/config";
import Loading from "@/components/common/Loading";
import * as FORM from "@/constants/forms";
import { MINE_TAILINGS } from "@/constants/routes";

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  mines: PropTypes.object.isRequired,
  mineGuid: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      tailingsStorageFacilityGuid: PropTypes.string,
      tab: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  fetchPartyRelationships: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  storeTsf: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  initialValues: {},
  mineGuid: null,
};

export const TailingsSummaryPage = (props) => {
  const { match, mines } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const mineGuid = props.mineGuid || match.params.mineGuid;

  const handleFetchData = async (forceReload = false) => {
    const { tailingsStorageFacilityGuid } = match?.params;
    await props.fetchPermits(mineGuid);

    await props.fetchPartyRelationships({
      mine_guid: mineGuid,
      relationships: "party",
      include_permit_contacts: "true",
    });

    if (tailingsStorageFacilityGuid) {
      if (!props.initialValues.mine_tailings_storage_facility_guid || forceReload) {
        const mine = await props.fetchMineRecordById(mineGuid);
        const existingTsf = mine.data.mine_tailings_storage_facilities.find(
          (tsf) => tsf.mine_tailings_storage_facility_guid === tailingsStorageFacilityGuid
        );
        props.storeTsf(existingTsf);
      }
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const mineName = mines[mineGuid]?.mine_name || "";

  return (
    (isLoaded && (
      <div>
        <Row>
          <Col span={24}>
            <Typography.Title>
              {props.initialValues.mine_tailings_storage_facility_name}
            </Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={MINE_TAILINGS.dynamicRoute(mineGuid)}>
              <ArrowLeftOutlined className="padding-sm--right" />
              Back to: {mineName} Tailings
            </Link>
          </Col>
        </Row>
        <Divider />
        <SteppedForm errors={[]} activeTab={match.params.tab}>
          <Step key="basic-information">
            <BasicInformation viewOnly renderConfig={renderConfig} />
          </Step>
          <Step key="engineer-of-record">
            <div>eor</div>
          </Step>
          <Step key="qualified-person">
            <div>qfp</div>
          </Step>
          <Step key="associated-dams">
            <div />
          </Step>
          <Step key="reports">
            <div />
          </Step>
          <Step key="summary">
            <div />
          </Step>
        </SteppedForm>
      </div>
    )) || <Loading />
  );
};

const mapStateToProps = (state) => ({
  mines: getMines(state),
  initialValues: getTsf(state),
  mineGuid: getMineGuid(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationships,
      fetchMineRecordById,
      touch,
      storeTsf,
      fetchPermits,
    },
    dispatch
  );

TailingsSummaryPage.propTypes = propTypes;
TailingsSummaryPage.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_STORAGE_FACILITY,
    touchOnBlur: true,
    touchOnChange: false,
    onSubmit: () => {
      resetForm(FORM.ADD_STORAGE_FACILITY);
    },
    enableReinitialize: true,
    destroyOnUnmount: true,
  })
)(withRouter(TailingsSummaryPage));
