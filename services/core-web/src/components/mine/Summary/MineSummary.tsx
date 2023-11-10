import React, { FC } from "react";
import { Row, Col, Divider, Card } from "antd";
import moment from "moment";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { formatDate } from "@common/utils/helpers";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import { getPartyRelationshipTypes } from "@common/selectors/staticContentSelectors";
import { getMineComplianceInfo } from "@common/selectors/complianceSelectors";
import { getMines } from "@common/selectors/mineSelectors";
import { getPermits } from "@common/selectors/permitSelectors";
import * as String from "@common/constants/strings";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import * as router from "@/constants/routes";
import PermitCard from "@/components/mine/Permit/MinePermitCard";
import { TSFCard } from "@/components/mine/Tailings/MineTSFCard";
import { DOC, OVERDUEDOC } from "@/constants/assets";
import MineHeader from "@/components/mine/MineHeader";
import MineWorkInformation from "@/components/mine/Summary/MineWorkInformation";
import {
  IMatch,
  IMine,
  IPartyRelationshipType,
  IPermitPartyRelationship,
  IMineComplianceInfo,
  IPermit,
} from "@mds/common";

/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

interface MineSummaryProps {
  match: IMatch;
  mines: Partial<IMine>;
  partyRelationshipTypes: IPartyRelationshipType[];
  partyRelationships: IPermitPartyRelationship[];
  mineComplianceInfo: IMineComplianceInfo;
  minePermits: Partial<IPermit>[];
}

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
  (!pr.end_date ||
    moment(pr.end_date)
      .add(1, "days")
      .toDate() > new Date()) &&
  (!pr.start_date || Date.parse(pr.start_date) <= new Date().getMilliseconds());

const activePermitteesByPermit = (pr, permit) =>
  isActive(pr) && pr.mine_party_appt_type_code === "PMT" && pr.related_guid === permit.permit_guid;

export const MineSummary: FC<MineSummaryProps> = (props) => {
  const { id } = props.match.params;
  const mine = props.mines[id];

  return (
    <div className="tab__content">
      <div>
        <h2>General</h2>
        <Divider />
      </div>
      <MineHeader mine={mine} {...props} />
      <br />
      <br />
      <br />
      <br />
      <MineWorkInformation mineGuid={id} />
      <br />
      {props.partyRelationships && props.partyRelationships.length > 0 && (
        <div>
          <br />
          <Row>
            <Col span={24}>
              <h4>Main Contacts</h4>
              <Divider />
            </Col>
          </Row>
          <Row gutter={16}>
            {props.partyRelationships
              .filter((pr) => pr.mine_party_appt_type_code === "MMG" && isActive(pr))
              .map((partyRelationship) =>
                renderPartyRelationship(
                  mine,
                  props.minePermits,
                  partyRelationship,
                  props.partyRelationshipTypes
                )
              )}
            {props.minePermits.map((permit) => {
              const latestPermittee = props.partyRelationships
                .filter((pr) => activePermitteesByPermit(pr, permit))
                .sort(
                  (a, b) => new Date(b.start_date).valueOf() - new Date(a.start_date).valueOf()
                )[0];
              return (
                latestPermittee &&
                renderPartyRelationship(
                  mine,
                  props.minePermits,
                  latestPermittee,
                  props.partyRelationshipTypes
                )
              );
            })}
          </Row>
          <Row>
            <Col span={24}>
              <div className="right">
                <Link to={router.MINE_CONTACTS.dynamicRoute(mine.mine_guid)}>See All Contacts</Link>
              </div>
            </Col>
          </Row>
        </div>
      )}
      {props.minePermits && props.minePermits.length > 0 && (
        <div>
          <Row>
            <Col span={24}>
              <h4>Permits</h4>
              <Divider />
            </Col>
          </Row>
          <Row gutter={16}>
            {props.minePermits.map((permit) =>
              renderSummaryPermit(permit, props.partyRelationships.filter(isActive))
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
      {props.mineComplianceInfo && (
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
                  <Row justify="center" align="middle">
                    <div className="center">
                      <span className="info-display">
                        {formatDate(props.mineComplianceInfo.last_inspection) ||
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
                  <Row justify="center" align="middle">
                    <img alt="Open Orders" src={DOC} style={{ height: 40, paddingRight: 5 }} />
                    <span className="info-display">{props.mineComplianceInfo.num_open_orders}</span>
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
                  <Row justify="center" align="middle">
                    <img
                      alt="Overdue Orders"
                      src={OVERDUEDOC}
                      style={{ height: 40, paddingRight: 5 }}
                    />
                    <span className="info-display">
                      {props.mineComplianceInfo.num_overdue_orders}
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
              renderSummaryTSF(tsf, props.partyRelationships.filter(isActive))
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
};

const mapStateToProps = (state) => ({
  mines: getMines(state),
  partyRelationships: getPartyRelationships(state),
  partyRelationshipTypes: getPartyRelationshipTypes(state),
  mineComplianceInfo: getMineComplianceInfo(state),
  minePermits: getPermits(state),
});

export default connect(mapStateToProps)(MineSummary);
