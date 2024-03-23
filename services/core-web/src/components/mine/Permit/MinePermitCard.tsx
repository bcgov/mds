import React, { FC } from "react";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import { getMineTenureTypesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import { IPermit, IPermitPartyRelationship } from "@mds/common";

interface MinePermitCardProps {
  permit?: IPermit;
  PartyRelationships?: IPermitPartyRelationship[];
  mineTenureHash: any;
}

export const PermitCard: FC<MinePermitCardProps> = (props) => {
  const pmt = props.PartyRelationships.filter((pr) => pr.mine_party_appt_type_code === "PMT")
    .filter((pmts) => pmts.related_guid.includes(props.permit.permit_guid))
    .sort((a, b) => new Date(b.start_date).valueOf() - new Date(a.start_date).valueOf())[0];
  return (
    <div>
      <h4>{props.permit.permit_no}</h4>
      <br />
      <h6>Last Amended</h6>
      <span>
        {props.permit.permit_amendments[0] ? (
          formatDate(props.permit.permit_amendments[0].issue_date)
        ) : (
          <i>No Amendments</i>
        )}
      </span>
      <br />
      <br />
      <h6>Permittee</h6>
      <span>{pmt ? pmt.party.name : <i>None Assigned</i>}</span>
      <br />
      <br />
      <h6>Site Property Tenure</h6>
      <span>
        {props.mineTenureHash[props.permit.site_properties?.mine_tenure_type_code] || <i>N/A</i>}
      </span>
      <br />
      <br />
      <h6>
        Inspection Fee Exemption
        <CoreTooltip title="Is this mine exempted from filing inspection fees?" />
      </h6>
      <span>{props.permit.exemption_fee_status_code === "Y" ? "Yes" : "No"}</span>
      <br />
      <br />
    </div>
  );
};

const mapStateToProps = (state) => ({
  mineTenureHash: getMineTenureTypesHash(state),
});

export default connect(mapStateToProps)(PermitCard);
