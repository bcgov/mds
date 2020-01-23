import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Col, Row } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMines } from "@/selectors/mineSelectors";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import { getPermits } from "@/reducers/permitReducer";
import CustomPropTypes from "@/customPropTypes";
import { fetchPermits } from "@/actionCreators/permitActionCreator";
import MMPermitApplicationInitForm from "@/components/Forms/noticeOfWork/MMPermitApplicationInitForm";
import { createDropDownList } from "@/utils/helpers";
import { createNoticeOfWorkApplication } from "@/actionCreators/noticeOfWorkActionCreator";

const propTypes = {
  mine_guid: PropTypes.string.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  createNoticeOfWorkApplication: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
};

export class MMPermitApplicationInit extends Component {
  componentDidMount() {
    this.props.fetchPermits(this.props.mine_guid);
  }

  handleAddPermitApplication = (values) => {
    const newValues = { mine_guid: this.props.mine_guid, ...values };
    this.props.createNoticeOfWorkApplication(newValues);
  };

  render() {
    return (
      <div className="tab__content">
        <h4>Start Permit Application for {this.props.mines[this.props.mine_guid].mine_name}:</h4>
        <br />
        <Row>
          <Col md={{ span: 20, offset: 2 }} xs={{ span: 20, offset: 2 }}>
            <MineCard mine={this.props.mines[this.props.mine_guid]} />
            <MMPermitApplicationInitForm
              title="Create Permit Application"
              onSubmit={this.handleAddPermitApplication}
              minePermits={createDropDownList(this.props.minePermits, "permit_no", "permit_guid")}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MMPermitApplicationInit);
