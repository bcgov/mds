import React from "react";
import { Row, Col, Divider, Card } from "antd";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import { getPartyRelationshipTypes, getPartyRelationships } from "@/selectors/partiesSelectors";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";

import { connect } from "react-redux";
import * as String from "@/constants/strings";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";
import { PermitCard } from "@/components/mine/Permit/MinePermitCard";
import { TSFCard } from "@/components/mine/Tailings/MineTSFCard";
import { formatDate } from "@/utils/helpers";

/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.partyRelationshipType),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  mineComplianceInfo: PropTypes.object,
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationships: [],
  mineComplianceInfo: {},
};

const renderPartyRelationship = (mine, partyRelationship, partyRelationshipTypes) => {
  if (partyRelationshipTypes.length === 0) return <div>{String.LOADING}</div>;

  const partyRelationshipTitle = partyRelationshipTypes.find(
    ({ mine_party_appt_type_code }) =>
      mine_party_appt_type_code === partyRelationship.mine_party_appt_type_code
  ).description;

  return (
    <Col
      xs={24}
      sm={24}
      md={24}
      lg={12}
      xl={8}
      xxl={6}
      key={partyRelationship.mine_party_appt_guid}
    >
      <Contact
        mine={mine}
        partyRelationship={partyRelationship}
        partyRelationshipTitle={partyRelationshipTitle}
        compact
      />
    </Col>
  );
};

const renderSummaryPermit = (permit, partyRelationships) => {
  if (partyRelationships.length === 0) return <div>{String.LOADING}</div>;
  return (
    <Col xs={24} sm={24} md={12} lg={8} xl={6} xxl={4} key={permit.permit_guid}>
      {" "}
      <PermitCard permit={permit} PartyRelationships={partyRelationships} />
    </Col>
  );
};

const renderSummaryTSF = (tsf, partyRelationships) => {
  if (partyRelationships.length === 0) return <div>{String.LOADING}</div>;
  return (
    <Col
      xs={24}
      sm={24}
      md={12}
      lg={8}
      xl={6}
      xxl={4}
      key={tsf.mine_tailings_storage_facility_guid}
    >
      {" "}
      <TSFCard tailingsStorageFacility={tsf} PartyRelationships={partyRelationships} />
    </Col>
  );
};

const isActive = (pr) =>
  (!pr.end_date || Date.parse(pr.end_date) >= new Date()) &&
  (!pr.start_date || Date.parse(pr.start_date) <= new Date());

export const MineSummary = (props) => {
  if (props.partyRelationships.length === 0) {
    return <NullScreen type="generic" />;
  }

  return (
    <div>
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
              .filter(isActive)
              .filter((pr) => ["MMG", "PMT"].includes(pr.mine_party_appt_type_code))
              .map((partyRelationship) =>
                renderPartyRelationship(props.mine, partyRelationship, props.partyRelationshipTypes)
              )}
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <div className="right">
                <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.guid, "contact-information")}>
                  See All Contacts
                </Link>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={16} type="flex" justify="center">
        <Col span={18}>
          <Row gutter={16}>
            <Col span={24}>
              <h4>Permits</h4>
              <Divider />
            </Col>
          </Row>
          <Row gutter={16} type="flex">
            {props.mine.mine_permit.map((permit) =>
              renderSummaryPermit(permit, props.partyRelationships)
            )}
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <div className="right">
                <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.guid, "permit")}>
                  See All Permits
                </Link>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      {props.mineComplianceInfo && props.mineComplianceInfo.last_inspection && (
        <Row gutter={16} type="flex" justify="center">
          <Col span={18}>
            <Row gutter={16}>
              <Col span={24}>
                <h4>Compliance</h4>
                <Divider />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Card
                  className="compliance-card"
                  title={
                    <div className="center">
                      <h1>{formatDate(props.mineComplianceInfo.last_inspection)}</h1>
                    </div>
                  }
                  bordered={false}
                >
                  <div className="center">
                    <h4>Last Inspection Date</h4>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  className="compliance-card"
                  title={
                    <div className="center">
                      <h1>{props.mineComplianceInfo.num_open_orders}</h1>
                    </div>
                  }
                  bordered={false}
                >
                  <div className="center">
                    <h4>Open Orders</h4>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  className="compliance-card"
                  title={
                    <div className="center">
                      <h1>{props.mineComplianceInfo.num_overdue_orders}</h1>
                    </div>
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
                  <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.guid, "compliance")}>
                    See All Compliance
                  </Link>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
      {props.mine.mine_tailings_storage_facility &&
        props.mine.mine_tailings_storage_facility.length > 0 && (
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16}>
                <Col span={24}>
                  <h4>Tailing Storage Facilities</h4>
                  <Divider />
                </Col>
              </Row>
              <Row gutter={16} type="flex" justify="center">
                {props.mine.mine_tailings_storage_facility.map((tsf) =>
                  renderSummaryTSF(tsf, props.partyRelationships.filter(isActive))
                )}
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
});

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineSummary);
