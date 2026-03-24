import React, { FC, useMemo, useEffect } from "react";
import { Field, FieldArray, change, getFormValues } from "@mds/common/components/forms/form";
import { IMineName, IMinespaceUser } from "@mds/common/interfaces";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderMultiSelect from "@mds/common/components/forms/RenderMultiSelect";
import { Typography, Divider, Button, Popconfirm, Row, Col } from "antd";
import { MINESPACE_POSITIONS } from "@mds/common/constants/strings";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/pro-light-svg-icons";
import LinkButton from "@mds/common/components/common/LinkButton";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getMineSearchResultsForNewUser } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineSearchResultsForNewUser } from "@mds/common/redux/actionCreators/mineActionCreator";
import { required, requiredList, requiredRadioButton } from "@mds/common/redux/utils/Validate";
import { uniq, uniqBy } from "lodash";
import { FORM } from "@mds/common/constants/forms";
import DocumentTable from "@mds/common/components/documents/DocumentTable";

interface MinespaceUserAccessModalProps {
    user: IMinespaceUser;
    handleUpdateUser: (user: IMinespaceUser) => void | Promise<void>;
    mines: IMineName[];
}

const ROLE_APPROVAL_OPTIONS = [
    { label: "Pending", value: true },
    { label: "Approved", value: false }
];

const USER_APPROVAL_OPTIONS = [
    { label: "Pending", value: 0 },
    { label: "Approved", value: 1 },
    { label: "Rejected", value: 2 }
];

const RenderRoleApprovals = ({ fields, mines, mineOptions, handleMineSearch }) => {
    return (
        <>
            {fields.map((field, index) => {
                const role = fields.get(index);
                const mine = mines?.find((m) => m.mine_guid === role.mine_guid);
                const isNewRole = !role.minespace_user_role_xref_guid;

                // For new roles, enable all options and deduplicate; for existing roles, include the mine in the options along with search results
                const allMineOptions = isNewRole
                    ? uniqBy(mineOptions.map(opt => ({ ...opt, disabled: false })), 'value')
                    : mine && !mineOptions.find(opt => opt.value === role.mine_guid)
                        ? [...mineOptions, { value: role.mine_guid, label: `${mine.mine_name} (${mine.mine_no})` }]
                        : mineOptions;

                return (
                    <div key={role.minespace_user_role_xref_guid || `new-${index}`} className="grey-box margin-large--bottom">
                        <Row gutter={16}>
                            <Col span={20}>
                                <Typography.Text strong>
                                    {isNewRole ? 'New Role Assignment' : 'Pending Role Request'}
                                </Typography.Text>
                            </Col>
                            <Col span={4}>
                                <Popconfirm
                                    placement="topLeft"
                                    title="Are you sure you want to remove this role?"
                                    onConfirm={() => fields.remove(index)}
                                    okText="Remove"
                                    cancelText="Cancel"
                                >
                                    <Button
                                        className="fa-icon-container btn-sm-padding"
                                        icon={<FontAwesomeIcon icon={faTrashAlt} />}
                                        type="primary"
                                        size="small"
                                        danger
                                    >
                                        Delete
                                    </Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col md={12} sm={24}>
                                <Field
                                    name={`${field}.mine_guid`}
                                    component={RenderSelect}
                                    label="Mine"
                                    data={allMineOptions}
                                    onSearch={handleMineSearch}
                                    placeholder={"Search by mine name, mine number, or permit number (minimum 3 characters)"}
                                    disabled={!isNewRole}
                                    required
                                    validate={[required]}
                                />
                            </Col>
                            <Col md={12} sm={24}>
                                <Field
                                    name={`${field}.minespace_user_role_code`}
                                    component={RenderSelect}
                                    label="Role"
                                    data={MINESPACE_POSITIONS}
                                    required
                                    validate={[required]}
                                />
                            </Col>
                        </Row>
                        {!isNewRole && (
                            <Field
                                name={`${field}.is_pending`}
                                component={RenderRadioButtons}
                                label="Status"
                                customOptions={ROLE_APPROVAL_OPTIONS}
                                required
                                validate={[requiredRadioButton]}
                            />
                        )}
                    </div>
                );
            })}
            <LinkButton
                onClick={() => fields.push({ is_pending: false })}
                title="Add new role assignment"
            >
                <PlusOutlined /> Add new role assignment
            </LinkButton>
        </>
    );
};


const MinespaceUserAccessModal: FC<MinespaceUserAccessModalProps> = ({
    user,
    mines,
    handleUpdateUser
}) => {
    const dispatch = useAppDispatch();
    const mineSearchResults = useAppSelector(getMineSearchResultsForNewUser);
    const formName = FORM.MINESPACE_USER_ACCESS_APPROVAL;
    const formValues = useAppSelector(getFormValues(formName)) as IMinespaceUser;
    const isPending = user?.access_request?.request_status === 0;
    const isRejectUser = formValues?.access_request?.request_status === 2;
    // Sync mines whenever user_roles changes
    useEffect(() => {
        if (!formValues) {
            return
        };

        const rolesMineGuids = formValues.user_roles.map(role => role?.mine_guid).filter(Boolean);
        const allMineGuids = uniq([...formValues.mines, ...rolesMineGuids]);

        const hasChanged = allMineGuids.length !== formValues.mines.length ||
            allMineGuids.some(guid => !formValues.mines.includes(guid));

        if (hasChanged) {
            dispatch(change(formName, 'mines', allMineGuids));
        }
    }, [formValues?.user_roles]);

    const mineOptions = useMemo(() => {
        if (!formValues) {
            return [];
        };

        // Get mine GUIDs that have corresponding roles (should be disabled)
        const roleMineGuids = new Set(
            formValues.user_roles.map(role => role?.mine_guid).filter(Boolean)
        );

        // Combine search results with mines from the user's existing roles and legacy mines
        const searchOptions = mineSearchResults.map((result) => ({
            value: result.mine_guid,
            label: `${result.mine_name} (${result.mine_no})${result.permit_no ? ` - Permit: ${result.permit_no}` : ''}`,
            disabled: roleMineGuids.has(result.mine_guid)
        }));

        const existingMineGuids = new Set(searchOptions.map(opt => opt.value));

        // Add mines from user roles that aren't in search results
        const roleMineOptions = formValues.user_roles
            .filter(role => role.mine_guid && !existingMineGuids.has(role.mine_guid))
            .map(role => {
                const mine = mines?.find(m => m.mine_guid === role.mine_guid);
                if (mine) {
                    existingMineGuids.add(role.mine_guid);
                    return {
                        value: role.mine_guid,
                        label: `${mine.mine_name} (${mine.mine_no})`,
                        disabled: true
                    };
                }
                return null;
            })
            .filter(Boolean);

        // Add legacy mines that aren't in search results or roles
        const legacyMineOptions = formValues.mines
            .filter(mineGuid => !existingMineGuids.has(mineGuid))
            .map(mineGuid => {
                const mine = mines?.find(m => m.mine_guid === mineGuid);
                if (mine) {
                    return {
                        value: mineGuid,
                        label: `${mine.mine_name} (${mine.mine_no})`
                    };
                }
                return null;
            })
            .filter(Boolean);

        return [...searchOptions, ...roleMineOptions, ...legacyMineOptions];
    }, [mineSearchResults, formValues?.user_roles, formValues?.mines, mines]);

    const handleMineSearch = (searchTerm: string) => {
        if (searchTerm && searchTerm.length >= 3) {
            dispatch(fetchMineSearchResultsForNewUser(searchTerm));
        }
    };

    return (
        <div>
            <FormWrapper
                name={formName}
                initialValues={user}
                onSubmit={handleUpdateUser}
                isModal
            >
                <div className="hide-required-indicator">
                    <Typography.Title level={3}>User Information</Typography.Title>
                    <Field
                        name="display_name"
                        component={RenderField}
                        label="Full Name"
                        disabled
                    />
                    <Field
                        name="bceid_username"
                        component={RenderField}
                        label="BCeID Username"
                        disabled
                    />
                    <Field
                        name="email"
                        component={RenderField}
                        label="Email Address"
                        disabled
                    />

                    <Divider />

                    <Typography.Title level={3}>Access Request Details</Typography.Title>

                    <Field
                        name="access_request.business_name"
                        component={RenderField}
                        label="Business Name"
                        disabled
                    />

                    <Field
                        name="access_request.access_request_text"
                        component={RenderField}
                        label="Access Request Notes"
                        disabled
                        help="Mines or permits that the user was unable to select"
                    />

                    <Field
                        name="access_request.ministry_contact"
                        component={RenderField}
                        label="Ministry Contact"
                        disabled
                    />
                    {formValues?.documents && <>
                        <Typography.Title level={3}>Documents</Typography.Title>
                        <DocumentTable
                            // @ts-ignore- this is probably the only instance without a mine_document_guid
                            documents={formValues.documents}
                            excludedColumnKeys={['category']}
                        />
                    </>}

                    {formValues?.access_request?.permittee && <>
                        <Typography.Title level={3}>Permittee Details</Typography.Title>
                        <Field
                            name="access_request.permittee.name"
                            component={RenderField}
                            label="Name"
                            disabled
                        />
                        <Field
                            name="access_request.permittee.title"
                            component={RenderField}
                            label="Title"
                            disabled
                        />
                        <Field
                            name="access_request.permittee.phone"
                            component={RenderField}
                            label="Phone"
                            disabled
                        />
                        <Field
                            name="access_request.permittee.email"
                            component={RenderField}
                            label="Email"
                            disabled
                        />
                    </>}
                </div>

                <Divider />

                <Typography.Title level={3}>Role Approvals</Typography.Title>
                <Typography.Paragraph>
                    Review and approve individual role requests for each mine:
                </Typography.Paragraph>

                <FieldArray
                    name="user_roles"
                    component={RenderRoleApprovals}
                    props={{ mines, mineOptions, handleMineSearch }}
                />

                <Divider />

                <Typography.Title level={3}>Mine Access</Typography.Title>
                <Typography.Paragraph>
                    Select mines for basic access without specific roles:
                </Typography.Paragraph>

                <Field
                    name="mines"
                    component={RenderMultiSelect}
                    label="Mines"
                    data={mineOptions}
                    onSearch={handleMineSearch}
                    placeholder="Search by mine name, mine number, or permit number (minimum 3 characters)"
                    required={!isRejectUser}
                    validate={isRejectUser ? [] : [requiredList]}
                />

                {isPending && (
                    <>
                        <Divider />
                        <Typography.Title level={3}>User Access Status</Typography.Title>
                        <Field
                            name="access_request.request_status"
                            component={RenderRadioButtons}
                            label="Grant required roles in keycloak"
                            customOptions={USER_APPROVAL_OPTIONS}
                            required
                            validate={[requiredRadioButton]}
                        />
                    </>
                )}

                <Row justify="end">
                    <RenderCancelButton />
                    <RenderSubmitButton buttonText="Save Changes" />
                </Row>
            </FormWrapper>
        </div>
    );
};

export default MinespaceUserAccessModal;