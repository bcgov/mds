import React from "react";
import { render } from "@testing-library/react";
import { PermitReviewBanner } from "./Permit/PermitReviewBanner";

it("renders correctly", () => {
    const height = 30;
    const { container } = render(<>
        <p>AI: review complete</p>
        <PermitReviewBanner height={height} isReviewComplete={true} isExtracted={true} />
        <p>AI: requires review</p>
        <PermitReviewBanner height={height} isReviewComplete={false} isExtracted={true} />
        <p>Drafted in core, cannot be modified</p>
        <PermitReviewBanner height={height} isReviewComplete={true} isExtracted={false} />
    </>);

    expect(container).toMatchSnapshot();
});