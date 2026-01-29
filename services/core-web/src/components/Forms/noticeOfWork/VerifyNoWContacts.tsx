import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { isEmpty, startCase } from "lodash";
import { Col, Row, Button, Card, Result, Input, Alert } from "antd";
import { PlusOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { FieldArray, Field, change as reduxFormChange } from "@mds/common/components/forms/form";

import * as FORM from "@/constants/forms";
import { getPartyRelationshipTypesList } from "@mds/common/redux/selectors/staticContentSelectors";
import { openModal as openModalAction, closeModal as closeModalAction } from "@mds/common/redux/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { required } from "@mds/common/redux/utils/Validate";
import {
    fetchSearchResults as fetchSearchResultsAction,
    clearAllSearchResults as clearAllSearchResultsAction,
    storeSubsetSearchResults as storeSubsetSearchResultsAction,
} from "@mds/common/redux/slices/searchSlice";
import { fetchPartyById as fetchPartyByIdAction, updateParty as updatePartyAction } from "@mds/common/redux/slices/partiesSlice";
import { TRASHCAN, PROFILE_NOCIRCLE } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import {
    getSearchResults,
    getSearchSubsetResults,
} from "@mds/common/redux/slices/searchSlice";
import * as Strings from "@mds/common/constants/strings";

import Address from "@/components/common/Address";
import AddButton from "@/components/common/buttons/AddButton";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import CoreTable from "@mds/common/components/common/CoreTable";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { IMinePartyApptType, IParty, IPartyRelationshipType } from "@mds/common/interfaces";

export interface VerifyNoWContactValue {
    id?: string;
    mine_party_appt_type_code?: string;
    mine_party_appt_type_code_description?: string;
    party_guid?: string | null;
    party?: any;
    [key: string]: any;
}

export interface VerifyNoWContactsProps {
    contactFormValues: VerifyNoWContactValue[];
    wasFormReset: boolean;
    isImporting: boolean;
}

const columns = [
    {
        title: "Select All",
        dataIndex: "name",
        key: "name",
        render: (text: string, record: any) => (
            <div>
                {text}
                <br />
                {record.email && record.email !== "Unknown" ? record.email : ""}
            </div>
        ),
    },
];

const transformData = (results: any[]) =>
    results &&
    results.map(({ result }) => ({
        key: result.party_guid,
        name: result.name,
        ...result,
    }));

interface RenderContactsArgs {
    fields: any;
    partyRelationshipTypes: IMinePartyApptType[];
    rolesUsedOnce: string[];
    confirmedContacts: string[];
    contactFormValues: VerifyNoWContactValue[];
    handleSearch: (e: any, contact: IParty, index: number, reverify?: boolean) => void;
    selectedContactIndex: number | "";
    selectedData: any[];
    isImporting: boolean;
}

const renderContacts = ({
    fields,
    partyRelationshipTypes,
    rolesUsedOnce,
    confirmedContacts,
    contactFormValues,
    handleSearch,
    selectedContactIndex,
    selectedData,
    isImporting,
}: RenderContactsArgs) => {
    const filteredRelationships = partyRelationshipTypes.filter((pr) =>
        ["MMG", "PMT", "THD", "LDO", "AGT", "EMM", "MOR"].includes(pr.value)
    );
    return (
        <Col span={8}>
            <Row className="contact-rows">
                <div className="scroll">
                    <Col span={24} style={{ minHeight: "150px" }}>
                        <h3>Application Contacts</h3>
                        <p>
                            Contacts listed here come from the original Notice of Work. Click &quot;Search
                            Contact&quot; to see a list of possible Core matches in the &quot;Matching Contact
                            Options&quot; column. Ensure the correct role has been assigned to the application
                            contact.
                        </p>
                    </Col>
                    {fields.map((field: string, index: number) => {
                        if (!fields.get(index).id) {
                            fields.get(index).id = uuidv4();
                        }

                        const contactExists = fields.get(index) && !isEmpty(fields.get(index).party);
                        const isSelectedContact = selectedContactIndex === index;
                        const selectedCorePartyGuid = contactFormValues
                            .filter(({ id }) => id === fields.get(index).id)
                            .map(({ party_guid }) => party_guid)[0];
                        const selectedCoreParty = selectedData
                            .filter(({ value }) => selectedCorePartyGuid === value)
                            .map((contact) => contact)[0];
                        const contactInformation = selectedCoreParty || fields.get(index);
                        const selectedClass = isSelectedContact ? "selected" : "";
                        const appointmentCode = contactFormValues
                            .filter(({ id }) => id === fields.get(index).id)
                            .map(({ mine_party_appt_type_code }) => mine_party_appt_type_code)[0];

                        return (
                            <Col span={24} key={fields.get(index).id}>
                                <Card
                                    hoverable
                                    className={`ant-card-now white inherit-height ${selectedClass}`}
                                    title={
                                        <div
                                            className="inline-flex between"
                                            style={{
                                                alignItems: "center",
                                                height: "55px",
                                            }}
                                        >
                                            <span className="field-title">{`Application ${contactExists
                                                ? fields.get(index).mine_party_appt_type_code_description
                                                : "Contact"
                                                }`}</span>
                                            {!confirmedContacts?.includes(fields.get(index).id) ? (
                                                <Button
                                                    ghost
                                                    disabled={isSelectedContact}
                                                    onClick={() => {
                                                        fields.remove(index);
                                                    }}
                                                >
                                                    <img
                                                        src={TRASHCAN}
                                                        alt="Remove Application Contact"
                                                        className={isSelectedContact ? "disabled-icon" : ""}
                                                    />
                                                </Button>
                                            ) : (
                                                <div className="confirm-success">
                                                    <Result status="success" title="Contact Confirmed" />
                                                </div>
                                            )}
                                        </div>
                                    }
                                    bordered={false}
                                >
                                    <Row align="middle" justify="center">
                                        <Col span={15}>
                                            <div className="inline-flex">
                                                <img
                                                    className="icon-sm padding-sm--right"
                                                    src={PROFILE_NOCIRCLE}
                                                    alt="user"
                                                    height={25}
                                                />
                                                <h4>
                                                    {contactExists || selectedCoreParty
                                                        ? startCase(contactInformation.party.name)
                                                        : "New Contact"}
                                                </h4>
                                            </div>
                                            {(contactExists || selectedCoreParty) && (
                                                <div>
                                                    <div className="inline-flex">
                                                        <div className="padding-sm--right">
                                                            <MailOutlined className="icon-sm" />
                                                        </div>
                                                        {contactInformation.party.email &&
                                                            contactInformation.party.email !== "Unknown" ? (
                                                            <a href={`mailto:${contactInformation.party.email}`}>
                                                                {contactInformation.party.email}
                                                            </a>
                                                        ) : (
                                                            <p>{Strings.EMPTY_FIELD}</p>
                                                        )}
                                                    </div>
                                                    <div className="inline-flex">
                                                        <div className="padding-sm--right">
                                                            <PhoneOutlined className="icon-sm" />
                                                        </div>
                                                        <p>
                                                            {contactInformation.party.phone_no}{" "}
                                                            {contactInformation.party.phone_ext
                                                                ? `x${contactInformation.party.phone_ext}`
                                                                : ""}
                                                        </p>
                                                    </div>
                                                    <Address address={contactInformation.party?.address[0] || {}} />
                                                </div>
                                            )}
                                        </Col>
                                        <Col span={9}>
                                            <Field
                                                usedOptions={rolesUsedOnce}
                                                id={`${field}.mine_party_appt_type_code`}
                                                name={`${field}.mine_party_appt_type_code`}
                                                label="Role"
                                                component={RenderSelect}
                                                data={filteredRelationships}
                                                required
                                                validate={[required]}
                                            />
                                            {confirmedContacts?.includes(fields.get(index).id) && (
                                                <Field
                                                    usedOptions={rolesUsedOnce}
                                                    id={`${field}.party_guid`}
                                                    name={`${field}.party_guid`}
                                                    label="Selected Core contact"
                                                    component={RenderSelect}
                                                    data={selectedData}
                                                    disabled
                                                    required
                                                    validate={[required]}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12} />
                                        <Col span={12}>
                                            {!confirmedContacts?.includes(fields.get(index).id) ? (
                                                <Button
                                                    type="primary"
                                                    style={{ float: "right" }}
                                                    disabled={isSelectedContact || !appointmentCode}
                                                    onClick={(event) => handleSearch(event, fields.get(index), index)}
                                                >
                                                    Search Contact
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="default"
                                                    style={{ float: "right" }}
                                                    disabled={isImporting}
                                                    onClick={(event) => handleSearch(event, fields.get(index), index, true)}
                                                >
                                                    Redo
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        );
                    })}
                    <Col span={24}>
                        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                            <div
                                role="button"
                                className="add-content-block"
                                tabIndex={0}
                                onKeyPress={() =>
                                    fields.push({ mine_party_appt_type_code: "", party_guid: "", id: uuidv4() })
                                }
                                onClick={() =>
                                    fields.push({ mine_party_appt_type_code: "", party_guid: "", id: uuidv4() })
                                }
                            >
                                <div className="inline-flex flex-center">
                                    <PlusOutlined className="icon-sm padding-sm--right" />
                                    <p>Add New Application Contact</p>
                                </div>
                            </div>
                        </AuthorizationWrapper>
                    </Col>
                </div>
            </Row>
        </Col>
    );
};

export const VerifyNoWContacts: React.FC<VerifyNoWContactsProps> = (props) => {
    const dispatch = useDispatch();

    const partyRelationshipTypesList = useSelector(getPartyRelationshipTypesList);
    const searchResults = useSelector(getSearchResults);
    const searchSubsetResults = useSelector(getSearchSubsetResults);

    const openModal = (cfg: any) => dispatch(openModalAction(cfg));
    const closeModal = () => dispatch(closeModalAction());
    const fetchSearchResults = (term: string, category: string) =>
        dispatch(fetchSearchResultsAction({ searchTerm: term, searchTypes: [category] }));
    const clearAllSearchResults = () => dispatch(clearAllSearchResultsAction());
    const storeSubsetSearchResults = (r: any) => dispatch(storeSubsetSearchResultsAction(r));
    const fetchPartyById = (pg: string) => dispatch(fetchPartyByIdAction(pg));
    const updateParty = (values: any, guid: string) => dispatch(updatePartyAction({ data: values, partyGuid: guid }));
    const change = (form: string, field: string, value: any) => dispatch(reduxFormChange(form, field, value));

    const [rolesUsedOnce, setRolesUsedOnce] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNOWContact, setSelectedNOWContact] = useState<any>({});
    const [selectedNOWContactIndex, setSelectedNOWContactIndex] = useState<number | "">("");
    const [isLoading, setIsLoading] = useState(false);
    const [allowSearch, setAllowSearch] = useState(false);
    const [selectedData, setSelectedData] = useState<any[]>([]);
    const [confirmedContacts, setConfirmedContacts] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [persistedSelectedResults, setPersistedSelectedResults] = useState<any[]>([]);

    const prevWasFormReset = useRef<boolean>(props.wasFormReset);
    const prevContactsRef = useRef(props.contactFormValues);

    const handleRoles = useCallback((contacts: VerifyNoWContactValue[]) => {
        let usedRoles: string[] = [];
        if (contacts.length > 0) {
            usedRoles = contacts.map(({ mine_party_appt_type_code }) => mine_party_appt_type_code).filter(Boolean) as string[];
        }
        const onlyOnce = usedRoles.filter((role) => role === "PMT" || role === "MMG");
        setRolesUsedOnce(onlyOnce);
    }, []);

    // Mount / unmount
    useEffect(() => {
        clearAllSearchResults();
        handleRoles(props.contactFormValues);
        return () => {
            clearAllSearchResults();
        };
    }, []);

    useEffect(() => {
        if (prevContactsRef.current !== props.contactFormValues) {
            handleRoles(props.contactFormValues);
            prevContactsRef.current = props.contactFormValues;
        }
    }, [props.contactFormValues, handleRoles]);

    useEffect(() => {
        if (!prevWasFormReset.current && props.wasFormReset) {
            setSelectedNOWContact({});
            setSelectedNOWContactIndex("");
            setAllowSearch(false);
            setConfirmedContacts([]);
            setSelectedRows([]);
        }
        prevWasFormReset.current = props.wasFormReset;
    }, [props.wasFormReset]);

    const handleReset = useCallback(() => {
        clearAllSearchResults();
        setSelectedNOWContact({});
        setSelectedNOWContactIndex("");
        setAllowSearch(false);
        setIsLoading(false);
        setSelectedRows([]);
    }, [clearAllSearchResults]);

    const formatPartyOption = useCallback((party: any, contactID: string) => {
        const option = { value: party.party_guid, label: party.name, party, contactID };
        setSelectedData((prev) => [option, ...prev]);
        return option.value;
    }, []);

    const handleSelect = useCallback(
        (e: any, party: any) => {
            e.preventDefault();
            setIsLoading(true);
            setConfirmedContacts((prev) => [selectedNOWContact.id, ...prev]);
            change(
                FORM.VERIFY_NOW_APPLICATION_FORM,
                `contacts[${selectedNOWContactIndex}].party_guid`,
                formatPartyOption(party, selectedNOWContact.id)
            );
            handleReset();
        },
        [change, formatPartyOption, handleReset, selectedNOWContact, selectedNOWContactIndex]
    );

    const handleSearch = useCallback(
        (e: any, contact: any, index: number, reverify = false) => {
            const term = contact.party?.name ?? "";
            if (reverify) {
                setConfirmedContacts((prev) => prev.filter((id) => id !== contact.id));
                setSelectedData((prev) => prev.filter(({ contactID }) => contactID !== contact.id));
                change(FORM.VERIFY_NOW_APPLICATION_FORM, `contacts[${index}].party_guid`, null);
            }
            setSearchTerm(term);
            setAllowSearch(true);
            setSelectedNOWContact(contact);
            setIsLoading(true);
            setSelectedNOWContactIndex(index);
            e.preventDefault();
            clearAllSearchResults();
            return Promise.resolve(fetchSearchResults(term, "party")).then(() => {
                setIsLoading(false);
                setSelectedRows([]);
            });
        },
        [change, clearAllSearchResults, fetchSearchResults]
    );

    const handleSimpleSearch = useCallback(
        (term: string) => {
            setIsLoading(true);
            setAllowSearch(true);
            return Promise.resolve(fetchSearchResults(term, "party")).then(() => setIsLoading(false));
        },
        [fetchSearchResults]
    );

    const editParty = useCallback(
        (partyGuid: string) => (values: any) => {
            return Promise.resolve(updateParty(values, partyGuid)).then(() => {
                closeModal();
                clearAllSearchResults();
                handleReSearch();
            });
        },
        [updateParty, closeModal, clearAllSearchResults]
    );

    const handleSelectedRows = useCallback(
        (rows: string[]) => {
            // Determine additions and removals
            const added = rows.filter((r) => !selectedRows.includes(r));
            const removed = selectedRows.filter((r) => !rows.includes(r));

            // Build new persisted list:
            setPersistedSelectedResults((prev) => {
                let next = [...prev];
                // Remove any that were unselected
                if (removed.length) {
                    next = next.filter(({ result }) => !removed.includes(result.party_guid));
                }
                // Add any newly selected that exist in current search results
                if (added.length) {
                    const toAdd = (searchResults?.party || []).filter(({ result }: any) => added.includes(result.party_guid));
                    // Avoid duplicates
                    toAdd.forEach((item: any) => {
                        if (!next.some(({ result }) => result.party_guid === item.result.party_guid)) {
                            next.push(item);
                        }
                    });
                }
                return next;
            });

            // Update subset results (detail pane) from union of current search results + persisted
            const unionResults = [
                ...(searchResults?.party || []),
                ...persistedSelectedResults.filter(
                    (p: any) => !(searchResults?.party || []).some(({ result }: any) => result.party_guid === p.result.party_guid)
                ),
            ];
            const subSetResults = unionResults.filter(({ result }: any) => rows.includes(result.party_guid));
            storeSubsetSearchResults(subSetResults);
            setSelectedRows(rows);
        },
        [searchResults, storeSubsetSearchResults, selectedRows, persistedSelectedResults]
    );

    const handleReSearch = useCallback(
        (partyGuid: string | null = null, newSearchTerm?: string) => {
            // Build the up-to-date selected rows list including a newly created party (if provided)
            const nextSelectedRows = partyGuid ? [partyGuid, ...selectedRows] : [...selectedRows];
            // Update selection state immediately so UI reflects the new selection
            if (partyGuid) {
                handleSelectedRows(nextSelectedRows);
            }

            if (newSearchTerm) {
                setSearchTerm(newSearchTerm);
            }

            setIsLoading(true);
            Promise.resolve(fetchSearchResults(newSearchTerm || searchTerm, "party")).then((action: any) => {
                const data = action?.payload ?? action;
                const partyResults: any[] = data?.search_results?.party ?? [];
                // Merge with any persisted selected results not present in latest search
                const merged = [
                    ...partyResults,
                    ...persistedSelectedResults.filter(
                        (p: any) => !partyResults.some(({ result }: any) => result.party_guid === p.result.party_guid)
                    ),
                ];
                const subSetResults = merged.filter(({ result }: any) => nextSelectedRows.includes(result.party_guid));
                setIsLoading(false);
                storeSubsetSearchResults(subSetResults);
            });
        },
        [fetchSearchResults, handleSelectedRows, searchTerm, selectedRows, storeSubsetSearchResults, persistedSelectedResults]
    );

    const openEditPartyModal = useCallback(
        (event: any, partyGuid: string, name: string) => {
            event.preventDefault();
            Promise.resolve(fetchPartyById(partyGuid)).then(() => {
                openModal({
                    props: {
                        partyGuid,
                        onSubmit: editParty(partyGuid),
                        title: `Update ${name}`,
                        provinceOptions: [],
                    },
                    content: modalConfig.EDIT_PARTY,
                    width: "75vw",
                });
            });
        },
        [fetchPartyById, openModal, editParty]
    );

    const showAddPartyModal = useCallback(
        (e: any) => {
            e.preventDefault();
            openModal({
                props: {
                    title: ModalContent.ADD_CONTACT,
                    partyRelationshipTypesList: partyRelationshipTypesList,
                    closeModal,
                    afterSubmit: (partyGuid: string | null, p: IParty) => handleReSearch(partyGuid, p?.name),
                    initialValues: {
                        ...(selectedNOWContact.party?.address?.[0] || {}),
                        ...selectedNOWContact.party,
                    },
                },
                content: modalConfig.ADD_QUICK_PARTY,
            });
        },
        [openModal, partyRelationshipTypesList, closeModal, handleReSearch, selectedNOWContact]
    );

    const coreContacts = useMemo(() => searchSubsetResults, [searchSubsetResults]);

    const renderCoreContacts = () => (
        <Col span={8}>
            <Row className="contact-rows">
                <div className="scroll">
                    <Col span={24} style={{ minHeight: "150px" }}>
                        <h3>Core Contact Detail</h3>
                        <p>
                            Use this information to determine if this is the correct contact to use in Core for
                            this application. Click &quot;Select Contact&quot; when you have found the right
                            match. You may update the contact if the information is incorrect.
                        </p>
                    </Col>
                    {coreContacts && coreContacts.length > 0 ? (
                        <Col span={24}>
                            {coreContacts.map(({ result }: any) => (
                                <Col span={24} key={result.party_guid}>
                                    <Card className="ant-card-now no-header inherit-height " bordered={false}>
                                        <Row>
                                            <Col span={24}>
                                                <div className="inline-flex">
                                                    <img
                                                        className="icon-sm padding-sm--right"
                                                        src={PROFILE_NOCIRCLE}
                                                        alt="user"
                                                        height={25}
                                                    />
                                                    <h4>{startCase(result.name)}</h4>
                                                </div>
                                                <div>
                                                    <div className="inline-flex">
                                                        <div className="padding-sm--right">
                                                            <MailOutlined className="icon-sm" />
                                                        </div>
                                                        {result.email && result.email !== "Unknown" ? (
                                                            <a href={`mailto:${result.email}`}>{result.email}</a>
                                                        ) : (
                                                            <p>{Strings.EMPTY_FIELD}</p>
                                                        )}
                                                    </div>
                                                    <div className="inline-flex">
                                                        <div className="padding-sm--right">
                                                            <PhoneOutlined className="icon-sm" />
                                                        </div>
                                                        <p>{result.phone_no}</p>
                                                    </div>
                                                    <Address address={result.address[0] || {}} />
                                                    {!result.phone_no && (
                                                        <Alert message="Phone number is required." type="error" showIcon />
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="right center-mobile">
                                            <Button
                                                className="full-mobile"
                                                type={"secondary" as any}
                                                onClick={(e) => openEditPartyModal(e, result.party_guid, result.name)}
                                            >
                                                Update Core Contact
                                            </Button>
                                            <Button
                                                className="full-mobile"
                                                type="primary"
                                                onClick={(e) => handleSelect(e, result)}
                                                disabled={!result.phone_no}
                                            >
                                                Select Contact
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Col>
                    ) : (
                        <Col span={24} className="card--white">
                            <p className="null">No Contact selected to verify</p>
                        </Col>
                    )}
                </div>
            </Row>
        </Col>
    );

    const renderSearchResults = () => (
        <Col span={8}>
            <Row className="contact-rows">
                <div className="scroll">
                    <Col span={24} style={{ minHeight: "150px" }}>
                        <h3>Matching Contact Options</h3>
                        <p>
                            Click on a contact(s) below to see their detailed information in the &quot;Contact
                            Detail&quot; column. If you cannot find a match, you can either search or create a
                            new contact.
                        </p>
                    </Col>
                    {allowSearch || isLoading ? (
                        <Col span={24} className="card--white">
                            <span style={{ float: "right" }}>
                                <AddButton onClick={(e) => showAddPartyModal(e)}>
                                    Add New Core Contact
                                </AddButton>
                            </span>
                            <Input.Search
                                placeholder="Search"
                                allowClear
                                type="buttom"
                                value={searchTerm}
                                onSearch={(term) => handleSimpleSearch(term)}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <br />
                            <LoadingWrapper condition={!isLoading}>
                                {(() => {
                                    // Combine current search results with persisted selections not in current search
                                    const combined = [
                                        ...(searchResults.party || []),
                                        ...persistedSelectedResults.filter(
                                            (p: any) => !(searchResults.party || []).some(({ result }: any) => result.party_guid === p.result.party_guid)
                                        ),
                                    ];
                                    return (
                                        <CoreTable
                                            className="party-table"
                                            columns={columns}
                                            dataSource={transformData(combined)}
                                            emptyText="No Results"
                                            rowSelection={{
                                                selectedRowKeys: selectedRows,
                                                onChange: (selectedRowKeys: string[]) => {
                                                    handleSelectedRows(selectedRowKeys);
                                                },
                                            }}
                                        />
                                    );
                                })()}
                            </LoadingWrapper>
                        </Col>
                    ) : (
                        <Col span={24} className="card--white">
                            <p className="null">No Contact selected to verify</p>
                        </Col>
                    )}
                </div>
            </Row>
        </Col>
    );

    return (
        <Row gutter={[16, 16]}>
            <FieldArray
                id="contacts"
                name="contacts"
                component={renderContacts as any}
                partyRelationshipTypes={partyRelationshipTypesList}
                rolesUsedOnce={rolesUsedOnce}
                confirmedContacts={confirmedContacts}
                contactFormValues={props.contactFormValues}
                handleSearch={handleSearch}
                selectedContactIndex={selectedNOWContactIndex}
                selectedData={selectedData}
                isImporting={props.isImporting}
            />
            {renderSearchResults()}
            {renderCoreContacts()}
        </Row>
    );
};

export default VerifyNoWContacts;
