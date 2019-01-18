import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Row, Col } from "antd";

import { getMine } from "@/selectors/userMineInfoSelector";
import CustomPropTypes from "@/customPropTypes";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import Loading from "@/components/common/Loading";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: {
      mineId: PropTypes.string,
    },
  }).isRequired,
};

// This file is anticipated to use state
// eslint-disable-next-line react/prefer-stateless-function
export class MineInfo extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { mineId } = this.props.match.params;
    this.props.fetchMineRecordById(mineId).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    if (!this.state.isLoaded) {
      return <Loading />;
    }

    return (
      <div>
        {this.props.mine && (
          <Row>
            <Col xs={1} sm={1} md={2} lg={4} />
            <Col xs={22} sm={22} md={14} lg={12}>
              <h1>{this.props.mine.mine_name}</h1>
              <p>{this.props.mine.mine_no}</p>
            </Col>
            <Col xs={22} sm={22} md={6} lg={4}>
              <QuestionSidebar />
            </Col>
            <Col xs={1} sm={1} md={2} lg={4} />
          </Row>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mine: getMine(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
    },
    dispatch
  );

MineInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineInfo);
