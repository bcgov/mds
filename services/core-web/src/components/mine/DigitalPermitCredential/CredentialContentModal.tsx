import { Col, Row, Typography } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCredentialExchangeDetails,
  getCredentialExchangeDetails,
} from "@mds/common/redux/slices/verifiableCredentialsSlice";

const CredentialContentModal = ({ partyGuid, credExchId }) => {
  const { Paragraph } = Typography;
  const dispatch = useDispatch();
  const credentialExchangeDetails: any[] = useSelector(getCredentialExchangeDetails);
  const credentialExchangeDetail: any = credentialExchangeDetails.find(
    (ced) => ced.credential_exchange_id === credExchId
  );

  useEffect(() => {
    dispatch(fetchCredentialExchangeDetails({ partyGuid, credentialExchangeGuid: credExchId }));
  }, []);

  return (
    <>
      {credentialExchangeDetail &&
        credentialExchangeDetail.credential_proposal_dict.credential_proposal.attributes.map(
          (attr) => {
            return (
              <Row key={attr.name} className="margin-large--bottom">
                <Col span={12}>
                  <Paragraph strong>{attr.name}</Paragraph>
                </Col>
                <Col span={12}>
                  <Paragraph>{attr.value}</Paragraph>
                </Col>
              </Row>
            );
          }
        )}
    </>
  );
};

export default CredentialContentModal;
