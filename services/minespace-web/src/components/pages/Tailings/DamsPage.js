import { Col, Divider, Row, Typography } from "antd";
import { Link, useParams } from "react-router-dom";

import { ADD_EDIT_DAM } from "@/constants/forms";
import DamForm from "@/components/Forms/tailing/tailingsStorageFacility/dam/DamForm";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import Step from "@/components/common/Step";
import SteppedForm from "@/components/common/SteppedForm";
import { compose } from "redux";
import { connect } from "react-redux";
import { createDam } from "@common/actionCreators/damActionCreator";
import { getDam } from "@common/selectors/damSelectors";
import { getTsf } from "@common/selectors/tailingsSelectors";
import { reduxForm } from "redux-form";
import { resetForm } from "@common/utils/helpers";
import { useParams } from "react-router-dom";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  tsf: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

const DamsPage = (props) => {
  const { tsf } = props;
  const { tailingsStorageFacilityGuid, damGuid } = useParams();

  const handleFetchData = async () => {
    const mine = await props.fetchMineRecordById(tsf.mine_guid);
    const existingTsf = mine.data.mine_tailings_storage_facilities.find(
      (tsf) => tsf.mine_tailings_storage_facility_guid === tailingsStorageFacilityGuid
    );
    props.storeTsf(existingTsf);
  };

  useEffect(() => {
    if (!tsf) {
      props.fetchMineRecordById(tailingsStorageFacilityGuid);
    }
  }, []);

  return (
    <div>
      <Row>
        <Col span={24}>
          <Typography.Title>{damGuid ? "Edit Dam" : "Create Dam"}</Typography.Title>
        </Col>
        <Col span={24}>
          <Link to={`/tailings/${tailingsStorageFacilityGuid}/dams`}>
            Back to {tsf.mine_tailings_storage_facility_name}
          </Link>
        </Col>
      </Row>
      <Divider />
      <SteppedForm
        errors={[]}
        handleSaveData={() => {}}
        handleTabChange={() => {}}
        activeTab="basic-dam-information"
      >
        {[
          <Step key="basic-dam-information">
            <DamForm />
          </Step>,
        ]}
      </SteppedForm>
    </div>
  );
};

const mapStateToProps = (state) => ({
  initialValues: getDam(state),
  tsf: getTsf(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ createDam, fetchMineRecordById }, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: ADD_EDIT_DAM,
    touchOnBlur: true,
    destroyOnUnmount: true,
    enableReinitialize: true,
    onSubmit: () => {
      resetForm(ADD_EDIT_DAM);
    },
  })
)(DamsPage);
