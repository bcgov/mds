import React, { Component } from "react";
import { Collapse, Icon } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import NOWGeneralInfo from "@/components/noticeOfWork/submissions/NOWGeneralInfo";
import NOWWorkPlan from "@/components/noticeOfWork/submissions/NOWWorkPlan";
import { fetchNoticeOfWorkSubmission } from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWork } from "@/selectors/noticeOfWorkSelectors";
import { getMineRegionHash } from "@/selectors/staticContentSelectors";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import * as Strings from "@/constants/strings";
/**
 * @class NoticeOfWorkSubmission - contains all information regarding to a notice of work application
 */

const { Panel } = Collapse;

const propTypes = {
  fetchNoticeOfWorkSubmission: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  match: CustomPropTypes.match.isRequired,
  regionHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class NoticeOfWorkSubmission extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchNoticeOfWorkSubmission(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    return (
      <div className="page__content">
        <div className="inline-flex between">
          <div>
            <h1>NoW Number: {this.props.noticeOfWork.trackingnumber || Strings.EMPTY_FIELD}</h1>
            {this.props.noticeOfWork.originating_system && (
              <h4>{`Originating System: ${this.props.noticeOfWork.originating_system}`}</h4>
            )}
            <div className="padding-md--top" />
            <p>
              The information below is a subset of all available data. Open the PDF for a
              comprehensive view.
            </p>
          </div>
          {/* Will be added when we have the PDF in following sprints */}
          {/* <Button type="primary">View PDF</Button> */}
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
            <LoadingWrapper condition={this.state.isLoaded}>
              <NOWGeneralInfo
                noticeOfWork={this.props.noticeOfWork}
                regionHash={this.props.regionHash}
              />
            </LoadingWrapper>
          </Panel>
          <Panel header={<h2>Work Plan</h2>} key="2">
            <LoadingWrapper condition={this.state.isLoaded}>
              <NOWWorkPlan noticeOfWork={this.props.noticeOfWork} />
            </LoadingWrapper>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  regionHash: getMineRegionHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchNoticeOfWorkSubmission }, dispatch);

NoticeOfWorkSubmission.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoticeOfWorkSubmission);
