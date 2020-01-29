import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Divider, Typography } from "antd";
import PropTypes from "prop-types";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import Loading from "@/components/common/Loading";

const { Paragraph, Title } = Typography;

const propTypes = {
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class UsersPage extends Component {
  state = { isLoaded: true };

  componentDidMount() {}

  render() {
    return (
      (this.state.isLoaded && (
        <Row>
          <Col>
            <Title>My Users</Title>
            <Divider />
            <Title level={2}>Welcome, {this.props.userInfo.preferred_username}.</Title>
            <Paragraph>This page is under construction.</Paragraph>
          </Col>
        </Row>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

UsersPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);
