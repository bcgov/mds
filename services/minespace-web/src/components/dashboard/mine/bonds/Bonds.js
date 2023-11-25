import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import { fetchMineBonds } from "@mds/common/redux/actionCreators/securitiesActionCreator";
import { getBonds } from "@mds/common/redux/selectors/securitiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import BondsTable from "@/components/dashboard/mine/bonds/BondsTable";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  bonds: PropTypes.arrayOf(CustomPropTypes.bond).isRequired,
  fetchMineBonds: PropTypes.func.isRequired,
};

export class Bonds extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchMineBonds(this.props.mine.mine_guid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    return (
      <Row>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Title level={4}>Bonds</Typography.Title>
              <Typography.Paragraph>
                This table shows&nbsp;
                <Typography.Text className="color-primary" strong>
                  bonds
                </Typography.Text>
                &nbsp;for your mine.
              </Typography.Paragraph>
              <br />
            </Col>
          </Row>
          <Row gutter={[16, 32]}>
            <Col span={24}>
              <BondsTable bonds={this.props.bonds} isLoaded={this.state.isLoaded} />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  bonds: getBonds(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineBonds,
    },
    dispatch
  );

Bonds.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Bonds);
