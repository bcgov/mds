import React, { FC } from "react";
import NOWPackagesTable, { Package, PackageDocument } from "./NOWPackagesTable";

export interface ReferralPackageDocument extends PackageDocument {
  now_application_referral_package_document_xref_guid: string;
}

export interface ReferralPackage extends Package {
  now_application_referral_package_id: number;
  now_application_referral_package_guid: string;
  documents: ReferralPackageDocument[];
}

interface NOWReferralPackagesTableProps {
  isLoaded: boolean;
  referralPackages: ReferralPackage[];
}

export const NOWReferralPackagesTable: FC<NOWReferralPackagesTableProps> = ({
  isLoaded,
  referralPackages = [],
}) => (
  <NOWPackagesTable isLoaded={isLoaded} packageType="referral" packages={referralPackages} />
);

export default NOWReferralPackagesTable;
