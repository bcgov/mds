import { Button } from 'antd';
import React from 'react';
import { useKeycloak } from "@react-keycloak/web";
import { KEYCLOAK } from '@mds/common';
import PropTypes from "prop-types";
import * as MINESPACE_ENV from "@/constants/environment";

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: 'login'
};

const LoginButton = (props) => {
    const { keycloak } = useKeycloak();

    const kcLogin = () => {
        keycloak.login({
            idpHint: KEYCLOAK.bceid_idpHint,
            redirectUri: MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI,
        }).then(() => console.log('looooooged in'))
    }

    return <Button
        type="primary"
        size="large"
        className={props.className || 'login'}
        style={{ "margin-right": "10px" }}
    >
        <a onClick={kcLogin}>
            Log in with BCeID
        </a>
    </Button>

}

LoginButton.propTypes = propTypes;
LoginButton.defaultProps = defaultProps;

export default LoginButton;