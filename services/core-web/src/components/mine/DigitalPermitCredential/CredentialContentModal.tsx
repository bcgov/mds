import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCredentialExchangeDetails,
  getCredentialExchangeDetails,
} from "@mds/common/redux/slices/verifiableCredentialsSlice";
import { ICredentialExchange, IMine } from "@mds/common";
import DigitalCredentialDetails from "@/components/mine/DigitalPermitCredential/DigitalCredentialDetails";

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

  const formatTractionDate = (dateString: string) => {
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);

    return `${year}-${month}-${day}T00:00:00`;
  };

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

  return <DigitalCredentialDetails permitRecord={details} mine={mine} />;
};

export default CredentialContentModal;
