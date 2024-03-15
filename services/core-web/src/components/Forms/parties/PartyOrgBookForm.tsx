import React, { FC, useState } from "react";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import { BookOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import { useDispatch } from "react-redux";
import {
  createPartyOrgBookEntity,
  fetchPartyById,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { ORGBOOK_ENTITY_URL } from "@/constants/routes";
import { IOrgbookCredential, IParty } from "@mds/common";
import OrgBookSearch from "@mds/common/components/parties/OrgBookSearch";

interface PartyOrgBookFormProps {
  party: IParty;
}

export const PartyOrgBookForm: FC<PartyOrgBookFormProps> = ({ party }) => {
  const [isAssociating, setIsAssociating] = useState(false);
  const dispatch = useDispatch();
  const [credential, setCredential] = useState<IOrgbookCredential>(null);

  const handleAssociateButtonClick = async () => {
    setIsAssociating(true);
    await dispatch(
      createPartyOrgBookEntity(party.party_guid, {
        credential_id: credential.id.toString(),
      })
    );
    await dispatch(fetchPartyById(party.party_guid));

    setIsAssociating(false);
  };

  const hasOrgBookCredential = !isEmpty(credential);

  return (
    <Row>
      <Col span={24}>
        <OrgBookSearch
          input={null}
          meta={null}
          isDisabled={isAssociating}
          setCredential={setCredential}
        />
      </Col>
      <Col span={24}>
        <Button
          className="full-mobile"
          href={hasOrgBookCredential ? ORGBOOK_ENTITY_URL(credential.topic.source_id) : null}
          target="_blank"
          disabled={!hasOrgBookCredential}
        >
          <span>
            <BookOutlined className="padding-sm--right" />
            View on OrgBook
          </span>
        </Button>
        <Button
          type="primary"
          className="full-mobile"
          disabled={!hasOrgBookCredential}
          onClick={handleAssociateButtonClick}
          loading={isAssociating}
        >
          <span>
            <CheckCircleOutlined className="padding-sm--right" />
            Associate
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default PartyOrgBookForm;
