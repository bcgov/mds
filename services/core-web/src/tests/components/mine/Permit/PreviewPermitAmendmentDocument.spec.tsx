import React from "react";
import { render, waitFor } from "@testing-library/react";
import { getDocument } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PreviewPermitAmendmentDocument } from "@/components/mine/Permit/PreviewPermitAmendmentDocument";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IPermitCondition } from "@mds/common/interfaces";

jest.mock("@mds/common/redux/utils/actionlessNetworkCalls", () => ({
    getDocument: jest.fn()
}));

const mockPermitAmendment = MOCK.PERMITS[0].permit_amendments[0];

const mockSelectedCondition: IPermitCondition = {
    ...MOCK.PERMITS[0].permit_amendments[0].conditions[0],
    permit_condition_guid: "test-condition",
    meta: {
        page: 1,
        bounding_box: {
            top: 100,
            right: 200,
            bottom: 300,
            left: 50
        }
    }
};

describe("PreviewPermitAmendmentDocument", () => {
    beforeEach(() => {
        (getDocument as jest.Mock).mockReset();
        (getDocument as jest.Mock).mockResolvedValue({ object_store_path: "test-url" });
    });

    it("renders skeleton while loading document", () => {
        const { container } = render(
            <ReduxWrapper>
                <PreviewPermitAmendmentDocument
                    amendment={mockPermitAmendment}
                    documentGuid="test-doc-guid"
                />
            </ReduxWrapper>
        );

        expect(container.querySelector(".ant-skeleton")).toBeTruthy();
        expect(container.querySelector("#preview-permit-amendment-pdf")).toBeFalsy();
    });

    it("fetches and displays document when documentGuid is provided", async () => {
        const { container } = render(
            <ReduxWrapper>
                <PreviewPermitAmendmentDocument
                    amendment={mockPermitAmendment}
                    documentGuid="31204ba5-5207-4fb5-b6c3-d47e55a0971c"
                />
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(getDocument).toHaveBeenCalledWith("64caef0e-060d-4875-a470-6c225b242723");
            expect(container.querySelector("#preview-permit-amendment-pdf")).toBeTruthy();
            expect(container.querySelector(".ant-skeleton")).toBeFalsy();

            expect(container).toMatchSnapshot();
        });
    });

    it("adds annotation when selected condition changes", async () => {
        const { rerender } = render(
            <ReduxWrapper>
                <PreviewPermitAmendmentDocument
                    amendment={mockPermitAmendment}
                    documentGuid="31204ba5-5207-4fb5-b6c3-d47e55a0971c"
                    selectedCondition={mockSelectedCondition}
                />
            </ReduxWrapper>
        );

        await waitFor(() => {
            expect(getDocument).toHaveBeenCalled();
        });

        rerender(
            <ReduxWrapper>
                <PreviewPermitAmendmentDocument
                    amendment={mockPermitAmendment}
                    documentGuid="31204ba5-5207-4fb5-b6c3-d47e55a0971c"
                    selectedCondition={{
                        ...mockSelectedCondition,
                        permit_condition_guid: "new-condition"
                    }}
                />
            </ReduxWrapper>
        );

    });

});