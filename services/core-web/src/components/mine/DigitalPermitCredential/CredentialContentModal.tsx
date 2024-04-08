import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCredentialExchangeDetails,
  getCredentialExchangeDetails,
} from "@mds/common/redux/slices/verifiableCredentialsSlice";
import { ICredentialExchange, IMine } from "@mds/common";
import DigitalCredentialDetails from "@/components/mine/DigitalPermitCredential/DigitalCredentialDetails";
import { formatTractionDate } from "@mds/common/redux/utils/helpers";
import { Alert } from "antd";

interface CredentialContentModalProps {
  partyGuid: string;
  credExchId: string;
  mine: IMine;
}

const CredentialContentModal: FC<CredentialContentModalProps> = ({
  partyGuid,
  credExchId,
  mine,
}) => {
  const [details, setDetails] = useState();
  const dispatch = useDispatch();
  const credentialExchangeDetails: ICredentialExchange[] = useSelector(
    getCredentialExchangeDetails
  );
  const credentialExchangeDetail: ICredentialExchange = credentialExchangeDetails.find(
    (ced) => ced.credential_exchange_id === credExchId
  );

  useEffect(() => {
    dispatch(fetchCredentialExchangeDetails({ partyGuid, credentialExchangeGuid: credExchId }));
  }, []);

  const convertAttributesToObject = (attributes: { name: string; value: string }[]) => {
    const attributesObject: any = {};
    attributes.forEach((attr) => {
      if (attr.name === "issue_date") {
        attributesObject[attr.name] = formatTractionDate(attr.value);
      } else {
        attributesObject[attr.name] = attr.value;
      }
    });
    attributesObject.active_bond_total = attributesObject.bond_total;
    attributesObject.current_permittee = attributesObject.permittee_name;
    attributesObject.site_properties = {
      mine_tenure_type_code: "",
      mine_commodity_code: [attributesObject.mine_commodity],
      mine_disturbance_code: [attributesObject.mine_disturbance],
    };

    return attributesObject;
  };

  useEffect(() => {
    if (credentialExchangeDetail) {
      setDetails(
        convertAttributesToObject(
          credentialExchangeDetail.credential_proposal_dict.credential_proposal.attributes
        )
      );
    }
  }, [credentialExchangeDetail]);

  const alert_text = `You are viewing data as it was issued in the digital credential. Last updated to the state ${credentialExchangeDetail.state} on ${credentialExchangeDetail.updated_at}.`;

  return (
    <div>
      <Alert type="warning" description={alert_text} showIcon className="margin-large--bottom" />
      <DigitalCredentialDetails permitRecord={details} mine={mine} />
    </div>
  );
};

export default CredentialContentModal;
