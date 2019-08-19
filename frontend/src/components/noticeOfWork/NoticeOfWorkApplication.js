import React, { Component } from "react";
import { Button, Collapse, Icon } from "antd";
import PropTypes from "prop-types";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import NOWGeneralInfo from "@/components/noticeOfWork/NOWGeneralInfo";
import NOWWorkPlan from "@/components/noticeOfWork/NOWWorkPlan";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import { fetchNoticeOfWorkApplication } from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWork } from "@/selectors/noticeOfWorkSelectors";
/**
 * @class NoticeOfWorkApplication - contains all information regarding to a notice of work application
 */

const { Panel } = Collapse;

const propTypes = {
  fetchNoticeOfWorkApplication: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  match: CustomPropTypes.match.isRequired,
};

export class NoticeOfWorkApplication extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchNoticeOfWorkApplication(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    return (
      <div className="page__content">
        <div className="inline-flex between">
          <div>
            <h1>NoW Number: </h1>
            <p>
              The information below is a subset of all available data. Open the PDF for a
              comprehensive view.
            </p>
          </div>
          <Button type="primary">View PDF</Button>
        </div>
        <br />
        <Collapse
          defaultActiveKey={["1", "2"]}
          expandIconPosition="right"
          expandIcon={({ isActive }) =>
            isActive ? <Icon type="minus-square" /> : <Icon type="plus-square" />
          }
        >
          <Panel header={<h2>General Information</h2>} key="1">
            {this.state.isLoaded && <NOWGeneralInfo noticeOfWork={this.props.noticeOfWork} />}
          </Panel>
          <Panel header={<h2>Work Plan</h2>} key="2">
            {this.state.isLoaded && <NOWWorkPlan noticeOfWork={this.props.noticeOfWork} />}
          </Panel>
        </Collapse>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ noticeOfWork: getNoticeOfWork(state) });

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchNoticeOfWorkApplication }, dispatch);

NoticeOfWorkApplication.propTypes = propTypes;

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  AuthorizationGuard("inTesting")
)(NoticeOfWorkApplication);
