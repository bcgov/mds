import React, { Component } from "react";
import { Row, Col, Divider, Card } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { formatDate } from "@common/utils/helpers";
import { getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import { getPartyRelationshipTypes } from "@mds/common/redux/selectors/staticContentSelectors";
import { getMineComplianceInfo } from "@mds/common/redux/selectors/complianceSelectors";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import * as String from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import * as router from "@/constants/routes";
import PermitCard from "@/components/mine/Permit/MinePermitCard";
import { TSFCard } from "@/components/mine/Tailings/MineTSFCard";
import { DOC, OVERDUEDOC } from "@/constants/assets";
import MineHeader from "@/components/mine/MineHeader";
import MineWorkInformation from "@/components/mine/Summary/MineWorkInformation";

/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  match: CustomPropTypes.match.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.partyRelationshipType),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationships: [],
  mineComplianceInfo: {},
};

const renderPartyRelationship = (mine, permits, partyRelationship, partyRelationshipTypes) => {
  if (partyRelationshipTypes.length === 0) return <div>{String.LOADING}</div>;

  const partyRelationshipTitle = partyRelationshipTypes.find(
    ({ mine_party_appt_type_code }) =>
      mine_party_appt_type_code === partyRelationship.mine_party_appt_type_code
  ).description;

  return (
    <Col md={24} lg={12} xl={8} xxl={6} key={partyRelationship.mine_party_appt_guid}>
      <Contact
        mine={mine}
        permits={permits}
        partyRelationship={partyRelationship}
        partyRelationshipTitle={partyRelationshipTitle}
        compact
      />
    </Col>
  );
};

const renderSummaryPermit = (permit, partyRelationships) => (
  <Col sm={24} md={12} lg={8} xl={6} xxl={4} key={permit.permit_guid}>
    <PermitCard permit={permit} PartyRelationships={partyRelationships} />
  </Col>
);

const renderSummaryTSF = (tsf, partyRelationships) => (
  <Col sm={24} md={12} lg={8} xl={6} xxl={4} key={tsf.mine_tailings_storage_facility_guid}>
    <TSFCard tailingsStorageFacility={tsf} PartyRelationships={partyRelationships} />
  </Col>
);

// Since end date is stored at yyyy-mm-dd, comparing current Date() to
// the the start of the next day ensures appointments ending today are displayed.
const isActive = (pr) =>
  (!pr.end_date || moment(pr.end_date).add(1, "days") > new Date()) &&
  (!pr.start_date || Date.parse(pr.start_date) <= new Date());

const activePermitteesByPermit = (pr, permit) =>
  isActive(pr) && pr.mine_party_appt_type_code === "PMT" && pr.related_guid === permit.permit_guid;

export class MineSummary extends Component {
  render() {
    const { id } = this.props.match.params;
    const mine = this.props.mines[id];

    return (
      <div className="tab__content">
        <div>
          <h2>General</h2>
          <Divider />
        </div>
        <MineHeader mine={mine} {...this.props} />
        <br />
        <br />
        <br />
        <br />
        <MineWorkInformation mineGuid={id} />
        <br />
        {this.props.partyRelationships && this.props.partyRelationships.length > 0 && (
          <div>
            <br />
            <Row>
              <Col span={24}>
                <h4>Main Contacts</h4>
                <Divider />
              </Col>
            </Row>
            <Row gutter={16}>
              {this.props.partyRelationships
                .filter((pr) => pr.mine_party_appt_type_code === "MMG" && isActive(pr))
                .map((partyRelationship) =>
                  renderPartyRelationship(
                    mine,
                    this.props.minePermits,
                    partyRelationship,
                    this.props.partyRelationshipTypes
                  )
                )}
              {this.props.minePermits.map((permit) => {
                const latestPermittee = this.props.partyRelationships
                  .filter((pr) => activePermitteesByPermit(pr, permit))
                  .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
                return (
                  latestPermittee &&
                  renderPartyRelationship(
                    mine,
                    this.props.minePermits,
                    latestPermittee,
                    this.props.partyRelationshipTypes
                  )
                );
              })}
            </Row>
            <Row>
              <Col span={24}>
                <div className="right">
                  <Link to={router.MINE_CONTACTS.dynamicRoute(mine.mine_guid)}>
                    See All Contacts
                  </Link>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {this.props.minePermits && this.props.minePermits.length > 0 && (
          <div>
            <Row>
              <Col span={24}>
                <h4>Permits</h4>
                <Divider />
              </Col>
            </Row>
            <Row gutter={16} type="flex">
              {this.props.minePermits.map((permit) =>
                renderSummaryPermit(permit, this.props.partyRelationships.filter(isActive))
              )}
            </Row>
            <Row>
              <Col span={24}>
                <div className="right">
                  <Link to={router.MINE_PERMITS.dynamicRoute(mine.mine_guid)}>See All Permits</Link>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {this.props.mineComplianceInfo && (
          <div>
            <Row gutter={16}>
              <Col span={24}>
                <h4>Compliance</h4>
                <Divider />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col lg={8} xs={24}>
                <Card
                  className="compliance-card"
                  title={
                    <Row type="flex" justify="center" align="middle">
                      <div className="center">
                        <span className="info-display">
                          {formatDate(this.props.mineComplianceInfo.last_inspection) ||
                            String.NO_NRIS_INSPECTIONS}
                        </span>
                      </div>
                    </Row>
                  }
                  bordered={false}
                >
                  <div className="center">
                    <h4>Last Inspection Date</h4>
                  </div>
                </Card>
              </Col>
              <Col lg={8} xs={12}>
                <Card
                  className="compliance-card"
                  title={
                    <Row type="flex" justify="center" align="middle">
                      <img alt="Open Orders" src={DOC} style={{ height: 40, paddingRight: 5 }} />
                      <span className="info-display">
                        {this.props.mineComplianceInfo.num_open_orders}
                      </span>
                    </Row>
                  }
                  bordered={false}
                >
                  <div className="center">
                    <h4>Open Orders</h4>
                  </div>
                </Card>
              </Col>
              <Col lg={8} xs={12}>
                <Card
                  className="compliance-card"
                  title={
                    <Row type="flex" justify="center" align="middle">
                      <img
                        alt="Overdue Orders"
                        src={OVERDUEDOC}
                        style={{ height: 40, paddingRight: 5 }}
                      />
                      <span className="info-display">
                        {this.props.mineComplianceInfo.num_overdue_orders}
                      </span>
                    </Row>
                  }
                  bordered={false}
                >
                  <div className="center">
                    <h4>Overdue Orders</h4>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <div className="right">
                  <Link to={router.MINE_INSPECTIONS.dynamicRoute(mine.mine_guid)}>
                    See All Compliance
                  </Link>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {mine.mine_tailings_storage_facilities && mine.mine_tailings_storage_facilities.length > 0 && (
          <div>
            <Row gutter={16}>
              <Col span={24}>
                <h4>Tailings Storage Facilities</h4>
                <Divider />
              </Col>
            </Row>
            <Row>
              {mine.mine_tailings_storage_facilities.map((tsf) =>
                renderSummaryTSF(tsf, this.props.partyRelationships.filter(isActive))
              )}
            </Row>

            <Row>
              <Col span={24}>
                <div className="right">
                  <Link to={router.MINE_TAILINGS.dynamicRoute(mine.mine_guid)}>
                    See All Tailings Storage Facilities
                  </Link>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  partyRelationships: getPartyRelationships(state),
  partyRelationshipTypes: getPartyRelationshipTypes(state),
  mineComplianceInfo: getMineComplianceInfo(state),
  minePermits: getPermits(state),
});

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineSummary);
