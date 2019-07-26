import React from "react";
import { Row, Col, Divider, Card } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import { getPartyRelationshipTypes, getPartyRelationships } from "@/selectors/partiesSelectors";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";

import * as String from "@/constants/strings";
import * as router from "@/constants/routes";
import { PermitCard } from "@/components/mine/Permit/MinePermitCard";
import { TSFCard } from "@/components/mine/Tailings/MineTSFCard";
import { formatDate } from "@/utils/helpers";
import { DOC, OVERDUEDOC } from "@/constants/assets";
import { getPermits } from "@/reducers/permitReducer";
/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.partyRelationshipType),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo,
  complianceInfoLoading: PropTypes.bool,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationships: [],
  mineComplianceInfo: {},
  complianceInfoLoading: true,
};

const renderPartyRelationship = (mine, partyRelationship, partyRelationshipTypes) => {
  if (partyRelationshipTypes.length === 0) return <div>{String.LOADING}</div>;

  const partyRelationshipTitle = partyRelationshipTypes.find(
    ({ mine_party_appt_type_code }) =>
      mine_party_appt_type_code === partyRelationship.mine_party_appt_type_code
  ).description;

  return (
    <Col md={24} lg={12} xl={8} xxl={6} key={partyRelationship.mine_party_appt_guid}>
      <Contact
        mine={mine}
        partyRelationship={partyRelationship}
        partyRelationshipTitle={partyRelationshipTitle}
        compact
      />
    </Col>
  );
};

const renderSummaryPermit = (permit, partyRelationships) => (
  <Col sm={24} md={12} lg={8} xl={6} xxl={4} key={permit.permit_guid}>
    {" "}
    <PermitCard permit={permit} PartyRelationships={partyRelationships} />
  </Col>
);

const renderSummaryTSF = (tsf, partyRelationships) => (
  <Col sm={24} md={12} lg={8} xl={6} xxl={4} key={tsf.mine_tailings_storage_facility_guid}>
    {" "}
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

export const MineSummary = (props) => {
  if (
    props.partyRelationships.length === 0 &&
    props.minePermits.length === 0 &&
    props.mine.mine_tailings_storage_facilities.length === 0 &&
    !props.mineComplianceInfo
  ) {
    return <NullScreen type="generic" />;
  }

  return (
    <div>
      {props.partyRelationships && props.partyRelationships.length > 0 && (
        <Row gutter={16} type="flex" justify="center">
          <Col span={18}>
            <Row gutter={16}>
              <Col span={24}>
                <h4>MAIN CONTACTS</h4>
                <Divider />
              </Col>
            </Row>
            <Row gutter={16} type="flex">
              {props.partyRelationships
                .filter((pr) => pr.mine_party_appt_type_code === "MMG" && isActive(pr))
                .map((partyRelationship) =>
                  renderPartyRelationship(
                    props.mine,
                    partyRelationship,
                    props.partyRelationshipTypes
                  )
                )}
              {props.minePermits.map((permit) => {
                const latestPermittee = props.partyRelationships
                  .filter((pr) => activePermitteesByPermit(pr, permit))
                  .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
                return (
                  latestPermittee &&
                  renderPartyRelationship(props.mine, latestPermittee, props.partyRelationshipTypes)
                );
              })}
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <div className="right">
                  <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.mine_guid, "contacts")}>
                    See All Contacts
                  </Link>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
      {props.minePermits && props.minePermits.length > 0 && (
        <Row gutter={16} type="flex" justify="center">
          <Col span={18}>
            <Row gutter={16}>
              <Col span={24}>
                <h4>PERMITS</h4>
                <Divider />
              </Col>
            </Row>
            <Row gutter={16} type="flex">
              {props.minePermits.map((permit) =>
                renderSummaryPermit(permit, props.partyRelationships.filter(isActive))
              )}
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <div className="right">
                  <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.mine_guid, "permit")}>
                    See All Permits
                  </Link>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
      {props.mineComplianceInfo && (
        <Row gutter={16} type="flex" justify="center">
          <Col span={18}>
            <Row gutter={16}>
              <Col span={24}>
                <h4>COMPLIANCE</h4>
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
                          {props.complianceInfoLoading
                            ? String.LOADING
                            : formatDate(props.mineComplianceInfo.last_inspection) ||
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
                      &nbsp;
                      <span className="info-display">
                        {props.complianceInfoLoading
                          ? String.LOADING
                          : props.mineComplianceInfo.num_open_orders}
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
                      &nbsp;
                      <span className="info-display">
                        {props.complianceInfoLoading
                          ? String.LOADING
                          : props.mineComplianceInfo.num_overdue_orders}
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

            <Row gutter={16}>
              <Col span={24}>
                <div className="right">
                  <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.mine_guid, "compliance")}>
                    See All Compliance
                  </Link>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
      {props.mine.mine_tailings_storage_facilities &&
        props.mine.mine_tailings_storage_facilities.length > 0 && (
          <Row gutter={16} type="flex" justify="center">
            <Col span={18}>
              <Row gutter={16}>
                <Col span={24}>
                  <h4>TAILINGS STORAGE FACILTIES</h4>
                  <Divider />
                </Col>
              </Row>
              <Row gutter={16}>
                {props.mine.mine_tailings_storage_facilities.map((tsf) =>
                  renderSummaryTSF(tsf, props.partyRelationships.filter(isActive))
                )}
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <div className="right">
                    <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.mine_guid, "tailings")}>
                      See Tailings Storage Facilities
                    </Link>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
  partyRelationshipTypes: getPartyRelationshipTypes(state),
  mineComplianceInfo: getMineComplianceInfo(state),
  minePermits: getPermits(state),
});

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineSummary);
