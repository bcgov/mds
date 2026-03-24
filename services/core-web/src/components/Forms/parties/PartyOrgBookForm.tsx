import React, { FC, useState } from "react";
import { Button, Col, Row } from "antd";
import { BookOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import { useDispatch } from "react-redux";
import {
  createPartyOrgBookEntity,
  deletePartyOrgBookEntity,
  fetchPartyById,
} from "@mds/common/redux/slices/partiesSlice";
import { ORGBOOK_ENTITY_URL } from "@/constants/routes";
import { IOrgbookCredential, IParty } from "@mds/common/interfaces";
import OrgBookSearch from "@mds/common/components/parties/OrgBookSearch";
import { useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";

interface PartyOrgBookFormProps {
  party: IParty;
}

export const PartyOrgBookForm: FC<PartyOrgBookFormProps> = ({ party }) => {
  const [isAssociating, setIsAssociating] = useState(false);
  const dispatch = useDispatch();
  const [credential, setCredential] = useState<IOrgbookCredential>(null);
  const [currentParty, setCurrentParty] = useState(party.party_orgbook_entity.name_text);
  const [isAssociated, setIsAssociated] = useState(!!party.party_orgbook_entity.name_text);

  const canManageOrgbook = useAppSelector(userHasRole(USER_ROLES.role_manage_orgbook));

  const handleAssociateButtonClick = async () => {
    setIsAssociating(true);
    await dispatch(
      createPartyOrgBookEntity({
        partyGuid: party.party_guid,
        data: {
          credential_id: credential.id.toString(),
        },
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
        {canManageOrgbook && (
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
        )}
      </Col>
    </Row>
  );
};

export default PartyOrgBookForm;
