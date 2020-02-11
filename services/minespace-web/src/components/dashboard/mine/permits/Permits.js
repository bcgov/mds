import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { getPermits } from "@common/reducers/permitReducer";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import PermitsTable from "@/components/dashboard/mine/permits/PermitsTable";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {};

export class Permits extends Component {
  state = { isLoaded: false };

  componentWillMount = () => {
    this.props.fetchPermits(this.props.mine.mine_guid).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Permits</Title>
          <Paragraph>
            The below table displays all of the&nbsp;
            <Text className="color-primary" strong>
              permit applications
            </Text>
            &nbsp;associated with this mine.
          </Paragraph>
          <PermitsTable isLoaded={this.state.isLoaded} permits={this.props.permits} />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchPermits }, dispatch);

Permits.propTypes = propTypes;
Permits.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Permits);
