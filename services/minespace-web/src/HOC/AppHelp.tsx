import { getHelpByKey, createHelp } from "@mds/common/redux/slices/appHelpSlice";
import { Button, Drawer } from "antd";
import React, { FC, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Switch, useParams } from "react-router-dom";
import * as routes from "@/constants/routes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import { Field } from "redux-form";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCheckbox from "@mds/common/components/forms/RenderCheckbox";

interface AppHelpContentProps {
    helpKey: string;
}
const AppHelpContent: FC<AppHelpContentProps> = ({ helpKey }) => {
    const dispatch = useDispatch();

    const params = useParams<any>();
    const { tab = "", activeTab = "" } = params;
    const tabKey = activeTab ?? tab;
    const keyToUse = tabKey ? `${helpKey}_${tabKey}` : helpKey;
    const [editMode, setEditMode] = useState(false);
    const appHelp = useSelector(getHelpByKey(helpKey, tabKey));
    const hasPermission = true;
    console.log(appHelp)

    const onSubmit = async (values) => {
        console.log('keyToUse', keyToUse)
        const { create_fallback } = values;
        const key = create_fallback ? helpKey : keyToUse
        await dispatch(createHelp({ helpKey: key, data: values }));
        setEditMode(false);
    }

    if (hasPermission && (!appHelp || editMode)) {
        return <FormWrapper
            name={`EDIT_APP_HELP-${keyToUse}`}
            onSubmit={onSubmit}
            initialValues={appHelp}
            reduxFormConfig={{ enableReinitialize: true }}
        >
            Editing page help for key: <b>{keyToUse}</b>
            <Field
                label="Enter content for page help"
                name="content"
                maximumCharacters={4000}
                component={RenderAutoSizeField}
            />
            <Field
                component={RenderCheckbox}
                name="is_draft"
                label="Save as draft"
            />
            {tabKey && <Field
                component={RenderCheckbox}
                name="create_fallback"
                label="For all tabs"
            />}
            <RenderSubmitButton />
        </FormWrapper>
    }
    if (appHelp && !appHelp.is_draft) {
        return (
            <>
                <div>{appHelp.content}</div>
                <div>
                    <Button onClick={() => setEditMode(true)}>Edit</Button>
                </div>
            </>
        );
    }
    return <div>this is a placeholder- there seems to be no help on this page</div>;
}

export const AppHelp: FC = () => {
    const [open, setOpen] = useState(false);

    const showDrawer = () => setOpen(true);
    const hideDrawer = () => setOpen(false);

    return (
        <Switch>
            {(Object.entries(routes)).map(([routeName, route]) => {
                return <Route
                    key={routeName}
                    exact={true}
                    path={route.route}
                >
                    {route.helpKey &&
                        <>
                            <Button onClick={showDrawer}>?</Button>
                            <Drawer placement="right" onClose={hideDrawer} open={open}>
                                <AppHelpContent helpKey={route.helpKey} /></Drawer>
                        </>}
                </Route>
            })}
        </Switch>
    );
}