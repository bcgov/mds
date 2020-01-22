import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Col, Row } from "antd";
import { connect } from "react-redux";
import { change } from "redux-form";
import PropTypes from "prop-types";
import * as FORM from "@/constants/forms";
import { getMineNames } from "@/selectors/mineSelectors";
import { getPermits } from "@/reducers/permitReducer";
import CustomPropTypes from "@/customPropTypes";
import { fetchPermits } from "@/actionCreators/permitActionCreator";
import MMPermitApplicationInitForm from "@/components/Forms/noticeOfWork/MMPermitApplicationInitForm";
import { createDropDownList } from "@/utils/helpers";
import { createNoticeOfWorkApplication } from "@/actionCreators/noticeOfWorkActionCreator";

const propTypes = {
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  change: PropTypes.func.isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
};

export class MMPermitApplicationInit extends Component {
  componentDidMount() {
    this.props.fetchPermits(this.props.noticeOfWork.mine_guid);
  }

  fetchMinePermits = (mineGuid) => {
    this.props.fetchPermits(mineGuid);
    this.props.change(FORM.MM_PERMIT_APPLICATION_CREATE, "permit_guid", null);
  };

  handleAddPermitApplication = (values) => {
    this.props.createNoticeOfWorkApplication(values);
  };

  render() {
    return (
      <div className="tab__content">
        <h4>Start Permit Application:</h4>
        <br />
        <Row>
          <Col md={{ span: 20, offset: 2 }} xs={{ span: 20, offset: 2 }}>
            <MMPermitApplicationInitForm
              initialValues={{ mine_guid: this.props.noticeOfWork.mine_guid }}
              title="Create Permit Application"
              onSubmit={this.handleAddPermitApplication}
              handleMineSelect={this.fetchMinePermits}
              minePermits={createDropDownList(this.props.minePermits, "permit_no", "permit_guid")}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineNameList: getMineNames(state),
  minePermits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNoticeOfWorkApplication,
      fetchPermits,
      change,
    },
    dispatch
  );

MMPermitApplicationInit.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MMPermitApplicationInit);
