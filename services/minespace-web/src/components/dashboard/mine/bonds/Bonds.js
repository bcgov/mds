import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import { fetchMineBonds } from "@common/actionCreators/securitiesActionCreator";
import { getBonds } from "@common/selectors/securitiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import BondsTable from "@/components/dashboard/mine/bonds/BondsTable";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  bonds: PropTypes.arrayOf(CustomPropTypes.bond).isRequired,
  fetchMineBonds: PropTypes.func.isRequired,
};

export class Bonds extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    console.log(this.props.mine.mine_guid);
    this.props.fetchMineBonds(this.props.mine.mine_guid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    return (
      <Row>
        <Col>
          <Row>
            <Col>
              <Title level={4}>Bonds</Title>
              <Paragraph>
                This table shows&nbsp;
                <Text className="color-primary" strong>
                  bonds
                </Text>
                &nbsp;for your mine.
              </Paragraph>
              <br />
            </Col>
          </Row>
          <Row gutter={[16, 32]}>
            <Col>
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
