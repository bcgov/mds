import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { AMS_ENVIRONMENT_DOCUMENTS } from "@mds/common/tests/mocks/dataMocks";
import EnvironmentAuthorizationDocumentsModal from "./EnvironmentAuthorizationDocumentsModal";

describe("EnvironmentAuthorizationDocumentsModal", () => {
    it("renders correctly and matches the snapshot", () => {
        const { container } = render(
            <ReduxWrapper>
                <BrowserRouter>
                    <EnvironmentAuthorizationDocumentsModal
                        documents={AMS_ENVIRONMENT_DOCUMENTS}
                    />
                </BrowserRouter>
            </ReduxWrapper>
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
