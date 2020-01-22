import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete, Button, Col, Row } from "antd";
import { connect } from "react-redux";
import { reset } from "redux-form";
import PropTypes from "prop-types";
import * as FORM from "@/constants/forms";
import { getMineNames } from "@/selectors/mineSelectors";
import { getPermits } from "@/reducers/permitReducer";
import CustomPropTypes from "@/customPropTypes";
import { fetchPermits } from "@/actionCreators/permitActionCreator";
import MMPermitApplicationInitForm from "@/components/Forms/noticeOfWork/MMPermitApplicationInitForm";
import { createDropDownList } from "@/utils/helpers";

const propTypes = {
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

export class MMPermitApplicationInit extends Component {
  state = {
    isLoaded: false,
    submitting: false,
  };

  componentDidMount() {}

  fetchMinePermits = (mineGuid) => {
    console.log(this.props);
    this.props.fetchPermits(mineGuid);
    reset(FORM.MM_PERMIT_APPLICATION_CREATE);
  };

  handleCreate() {
    this.setState({ submitting: true });
    console.log("POST HERE");
    this.setState({ submitting: false });
  }

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
              handleSubmit={this.handleCreate}
              handleMineSelect={this.fetchMinePermits}
              minePermits={createDropDownList(this.props.minePermits, "permit_no", "permit_guid")}
              submitting={this.state.submitting}
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
      fetchPermits,
    },
    dispatch
  );

MMPermitApplicationInit.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MMPermitApplicationInit);
