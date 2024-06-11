import React, { FC, useState } from "react";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import { BookOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import { useDispatch } from "react-redux";
import {
  createPartyOrgBookEntity,
  deletePartyOrgBookEntity,
  fetchPartyById,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { ORGBOOK_ENTITY_URL } from "@/constants/routes";
import { IOrgbookCredential, IParty } from "@mds/common";
import OrgBookSearch from "@mds/common/components/parties/OrgBookSearch";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

interface PartyOrgBookFormProps {
  party: IParty;
}

export const PartyOrgBookForm: FC<PartyOrgBookFormProps> = ({ party }) => {
  const [isAssociating, setIsAssociating] = useState(false);
  const dispatch = useDispatch();
  const [credential, setCredential] = useState<IOrgbookCredential>(null);
  const [currentParty, setCurrentParty] = useState(party.party_orgbook_entity.name_text);
  const [isAssociated, setIsAssociated] = useState(!!party.party_orgbook_entity.name_text);

  const handleAssociateButtonClick = async () => {
    setIsAssociating(true);
    await dispatch(
      createPartyOrgBookEntity(party.party_guid, {
        credential_id: credential.id.toString(),
      })
    );
    await dispatch(fetchPartyById(party.party_guid));

    setIsAssociating(false);
    setIsAssociated(true);
  };

  const handleDisassociateButtonClick = async () => {
    setIsAssociating(true);

    await dispatch(deletePartyOrgBookEntity(party.party_guid));
    await dispatch(fetchPartyById(party.party_guid));
    setIsAssociating(false);
    setCurrentParty("");
    setIsAssociated(false);
  };

  const hasOrgBookCredential = !isEmpty(credential);

  return (
    <Row>
      <Col span={24}>
        <OrgBookSearch
          isDisabled={isAssociated}
          setCredential={setCredential}
          current_party={currentParty}
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
        <AuthorizationWrapper permission={Permission.ADMIN}>
          <Button
            type="primary"
            className="full-mobile"
            disabled={!isAssociated ? !hasOrgBookCredential : false} //Admin is allowed to disassociate
            onClick={!isAssociated ? handleAssociateButtonClick : handleDisassociateButtonClick}
            loading={isAssociating}
            danger={isAssociated}
          >
            <span>
              <CheckCircleOutlined className="padding-sm--right" />
              {!isAssociated ? "Associate" : "Disassociate"}
            </span>
          </Button>
        </AuthorizationWrapper>
      </Col>
    </Row>
  );
};

export default PartyOrgBookForm;
