import React, { FC } from "react";
import NOWPackagesTable, { Package, PackageDocument } from "./NOWPackagesTable";

export interface ConsultationPackageDocument extends PackageDocument {
  now_application_consultation_package_document_xref_guid: string;
}

export interface ConsultationPackage extends Package {
  now_application_consultation_package_id: number;
  now_application_consultation_package_guid: string;
  documents: ConsultationPackageDocument[];
}

interface NOWConsultationPackagesTableProps {
  isLoaded: boolean;
  consultationPackages: ConsultationPackage[];
}

export const NOWConsultationPackagesTable: FC<NOWConsultationPackagesTableProps> = ({
  isLoaded,
  consultationPackages = [],
}) => (
  <NOWPackagesTable
    isLoaded={isLoaded}
    packageType="consultation"
    packageKey="now_application_consultation_package_guid"
    documentKey="now_application_consultation_package_document_xref_guid"
    packages={consultationPackages}
  />
);

export default NOWConsultationPackagesTable;
