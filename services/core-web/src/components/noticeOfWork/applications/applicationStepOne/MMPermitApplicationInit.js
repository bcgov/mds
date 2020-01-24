import React, { Component } from "react";
import { Col, Row } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { getMines } from "@/selectors/mineSelectors";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import { getPermits } from "@/reducers/permitReducer";
import CustomPropTypes from "@/customPropTypes";
import { fetchPermits } from "@/actionCreators/permitActionCreator";
import MMPermitApplicationInitForm from "@/components/Forms/noticeOfWork/MMPermitApplicationInitForm";
import { createDropDownList } from "@/utils/helpers";
import { createNoticeOfWorkApplication } from "@/actionCreators/noticeOfWorkActionCreator";
import * as routes from "@/constants/routes";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  initialPermitGuid: PropTypes.string,
  fetchPermits: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
};

const defaultProps = {
  initialPermitGuid: "",
};

export class MMPermitApplicationInit extends Component {
  state = {
    isSubmitting: false,
  };

  componentDidMount() {
    this.props.fetchPermits(this.props.mineGuid);
  }

  handleAddPermitApplication = (values) => {
    const newValues = { mine_guid: this.props.mineGuid, ...values };
    this.setState({ isSubmitting: true });
    this.props.createNoticeOfWorkApplication(newValues).then((response) => {
      if (response) {
        this.props.history.push(
          routes.NOTICE_OF_WORK_APPLICATION.dynamicRoute(response.data.now_application_guid)
        );
      } else {
        this.setState({ isSubmitting: false });
      }
    });
  };

  render() {
    return (
      <div className="tab__content">
        <h4>Start Permit Application for {this.props.mines[this.props.mineGuid].mine_name}:</h4>
        <br />
        <Row>
          <Col md={{ span: 20, offset: 2 }} xs={{ span: 20, offset: 2 }}>
            <MineCard mine={this.props.mines[this.props.mineGuid]} />
            <MMPermitApplicationInitForm
              title="Create Permit Application"
              initialValues={{ permit_guid: this.props.initialPermitGuid }}
              onSubmit={this.handleAddPermitApplication}
              minePermits={createDropDownList(this.props.minePermits, "permit_no", "permit_guid")}
              isSubmitting={this.state.isSubmitting}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  minePermits: getPermits(state),
  mines: getMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNoticeOfWorkApplication,
      fetchPermits,
    },
    dispatch
  );

MMPermitApplicationInit.propTypes = propTypes;
MMPermitApplicationInit.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(MMPermitApplicationInit));
