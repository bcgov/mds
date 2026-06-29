"""Hardcoded NOW regional checklist requirements.

BC Notice of Work completeness checklist items for mining applications.
"""

from __future__ import annotations

# Hardcoded checklist requirements extracted from now_regional_checklist.xlsx
# Keep section names aligned to template section headers (column A) so downstream
# template row-matching logic can map findings reliably.
_CHECKLIST_REQUIREMENTS = [
    # Intake Process
    {"section": "Intake Process", "requirement": "Enter NoW information into the 'Line Up' tab of the NoW tracker"},
    {"section": "Intake Process", "requirement": "Fill NoW # cell yellow until pushed to Core"},
    {"section": "Intake Process", "requirement": "Create application file in the LAN"},
    {"section": "Intake Process", "requirement": "Download NoW Application and documents and save in the LAN"},
    {"section": "Intake Process", "requirement": "Review NoW"},
    {"section": "Intake Process", "requirement": "NoW Application Completeness"},
    {"section": "Intake Process", "requirement": "Determine MX Tier"},
    {"section": "Intake Process", "requirement": "Change file status on the NoW Tracker to 'GIS Start'"},
    {"section": "Intake Process", "requirement": "Push to Core"},
    {"section": "Intake Process", "requirement": "Verify in Core"},
    {"section": "Intake Process", "requirement": "Associate Orgbook if applicable"},
    {"section": "Intake Process", "requirement": "Send Application Accepted/Not-Accepted email to proponent"},

    # NoW Application
    {"section": "NoW Application", "requirement": "Project Name:"},
    {"section": "NoW Application", "requirement": "NoW #:"},
    {"section": "NoW Application", "requirement": "Application Type:"},
    {"section": "NoW Application", "requirement": "Date Received:"},
    {"section": "NoW Application", "requirement": "Date(s) Sent Back:"},
    {"section": "NoW Application", "requirement": "Map - Location"},
    {"section": "NoW Application", "requirement": "Map - Title (tenure)"},
    {"section": "NoW Application", "requirement": "Map - Proposed/Permitted Mine Area (PMA)"},
    {"section": "NoW Application", "requirement": "PMA Shape File - .shp"},
    {"section": "NoW Application", "requirement": "PMA Shape File - .shx"},
    {"section": "NoW Application", "requirement": "PMA Shape File - .dbf"},
    {"section": "NoW Application", "requirement": "PMA Shape File - .prj"},
    {
        "section": "NoW Application",
        "requirement": "Annual Summary (current year/up to date) *Hold up if multiple year reports missing",
    },
    {"section": "NoW Application", "requirement": "Mine Emergency Response Plan (MERP)"},
    {"section": "NoW Application", "requirement": "Erosion and Sediment Control Plan (Inspector request)"},
    {"section": "NoW Application", "requirement": "Applicant Information"},
    {"section": "NoW Application", "requirement": "Contact Information"},
    {"section": "NoW Application", "requirement": "Applicant"},
    {"section": "NoW Application", "requirement": "Company in good standing"},
    {"section": "NoW Application", "requirement": "Agent"},
    {"section": "NoW Application", "requirement": "Letter of Agency/Authorization Letter"},
    {"section": "NoW Application", "requirement": "Correspondence E-mail Address"},
    {"section": "NoW Application", "requirement": "Tenures/Mineral Crown Grant"},
    {"section": "NoW Application", "requirement": "Ownership Check - (download spreadsheet from MTO)"},
    {"section": "NoW Application", "requirement": "Tenure Authorization"},
    {"section": "NoW Application", "requirement": "Directions to site"},
    {"section": "NoW Application", "requirement": "Maximum Annual Tonnage"},
    {"section": "NoW Application", "requirement": "Information About Proposed Activities"},
    {"section": "NoW Application", "requirement": "Description of Work Program"},
    {"section": "NoW Application", "requirement": "Description of Work Program (attachment if applicable)"},
    {"section": "NoW Application", "requirement": "Time of Proposed Activities"},
    {"section": "NoW Application", "requirement": "Access"},
    {"section": "NoW Application", "requirement": "Present State of Land"},
    {"section": "NoW Application", "requirement": "Access to Tenure"},
    {"section": "NoW Application", "requirement": "Land Ownership"},
    {"section": "NoW Application", "requirement": "Indigenous Engagement"},
    {"section": "NoW Application", "requirement": "Engagement Record"},
    {"section": "NoW Application", "requirement": "Cultural Heritage Resources"},
    {"section": "NoW Application", "requirement": "Cultural Heritage Protection Plan "},
    {"section": "NoW Application", "requirement": "Archaeological Chance Find Procedure"},
    {
        "section": "NoW Application",
        "requirement": "Archaeological Assessment Reports /Permits (provide if they have had them)",
    },
    {
        "section": "NoW Application",
        "requirement": "Camps, Buildings, Staging Areas and Fuel/Lubricants Storage",
    },
    {"section": "NoW Application", "requirement": "Map - camp"},
    {"section": "NoW Application", "requirement": "Map - buildings "},
    {"section": "NoW Application", "requirement": "Map - staging area"},
    {"section": "NoW Application", "requirement": "Map - fuel storage"},
    {"section": "NoW Application", "requirement": "Shape Files"},
    {"section": "NoW Application", "requirement": "Reclamation"},
    {"section": "NoW Application", "requirement": "Mechanical Trenching/Test Pits"},
    {"section": "NoW Application", "requirement": "Map"},
    {"section": "NoW Application", "requirement": "Shape Files"},
    {"section": "NoW Application", "requirement": "Reclamation"},
    {"section": "NoW Application", "requirement": "Exploration Surface Drilling"},
    {
        "section": "NoW Application",
        "requirement": "Map (unless it is an area based application) - Year one mapping mandatory",
    },
    {"section": "NoW Application", "requirement": "Shape Files"},
    {"section": "NoW Application", "requirement": "Reclamation"},
    {"section": "NoW Application", "requirement": "Exploration Underground Drilling"},
    {"section": "NoW Application", "requirement": "Map (unless it is an area based application)"},
    {"section": "NoW Application", "requirement": "Shape Files"},
    {"section": "NoW Application", "requirement": "Ventilation"},
    {"section": "NoW Application", "requirement": "Ground Control"},
    {
        "section": "NoW Application",
        "requirement": "Engineering Designs/Drawings (P. Eng.) (Inspector request)",
    },
    {"section": "NoW Application", "requirement": "ML/ARD (Inspector request)"},
    {"section": "NoW Application", "requirement": "Reclamation"},
    {"section": "NoW Application", "requirement": "Access Roads, Trails, Heli Pads, Air Strips and Boat Ramps"},
    {"section": "NoW Application", "requirement": "Map - location of proposed access roads and trails."},
    {"section": "NoW Application", "requirement": "Shape Files"},
    {
        "section": "NoW Application",
        "requirement": "Engineering Designs/Drawings (P. Eng.) (Inspector request)",
    },
    {"section": "NoW Application", "requirement": "Reclamation"},
    {"section": "NoW Application", "requirement": "Water Supply"},
    {"section": "NoW Application", "requirement": "Map"},
    {"section": "NoW Application", "requirement": "Shape Files"},
    {"section": "NoW Application", "requirement": "Blasting"},
    {"section": "NoW Application", "requirement": "Map - Where blasting will take place"},
    {"section": "NoW Application", "requirement": "Map - On Site Storage of Explosives"},
    {"section": "NoW Application", "requirement": "Blasting Procedure"},
    {"section": "NoW Application", "requirement": "Explosives Magazine Storage and Use Permit (if required)"},
    {"section": "NoW Application", "requirement": "Cut Lines and Induced Polarization"},
    {"section": "NoW Application", "requirement": "Map (unless it is an area based application)"},
    {"section": "NoW Application", "requirement": "Shape Files"},
    {"section": "NoW Application", "requirement": "Reclamation"},
    {"section": "NoW Application", "requirement": "Bulk Sample Supporting Documents"},
    {
        "section": "NoW Application",
        "requirement": "Appropriate Tenure for qty of material removal (claim/lease amounts)",
    },
    {"section": "NoW Application", "requirement": "ML/ARD"},
    {"section": "NoW Application", "requirement": "Handling Plans"},
    {"section": "NoW Application", "requirement": "Mill Letter (Inspector Requiest)"},
    {"section": "NoW Application", "requirement": "Settling Ponds"},
    {"section": "NoW Application", "requirement": "Map"},
    {"section": "NoW Application", "requirement": "Shape Files"},
    {
        "section": "NoW Application",
        "requirement": "Engineering Designs/Drawings (P. Eng.) (Inspector request)",
    },
    {"section": "NoW Application", "requirement": "Timber Cutting"},
    {"section": "NoW Application", "requirement": "Amount:"},
    {"section": "NoW Application", "requirement": "OLTC application (license/application #)"},
    {"section": "NoW Application", "requirement": "Equipment"},
    {"section": "NoW Application", "requirement": "Summary of Reclamation"},
    {"section": "NoW Application", "requirement": "Other Contacts"},
    {"section": "NoW Application", "requirement": "Mine Manager Authorization Letter"},

    # MX Tier Category
    {"section": "Tier 1", "requirement": "Surface Drilling"},
    {"section": "Tier 1", "requirement": "New Exploration Access"},
    {"section": "Tier 1", "requirement": "Existing Access Modification"},
    {"section": "Tier 1", "requirement": "Heli Pads"},
    {"section": "Tier 1", "requirement": "Short term industrial camp"},
    {"section": "Tier 1", "requirement": "Water Supply"},
    {"section": "Tier 1", "requirement": "<= 25 small (15m x 15m) drill sites"},
    {
        "section": "Tier 1",
        "requirement": "< 1km new exploration access construction -No new QP engineered stream crossings",
    },
    {"section": "Tier 1", "requirement": "<= 5 km existing access modification"},
    {"section": "Tier 1", "requirement": "Seasonal camps including constructed pads"},
    {"section": "Tier 1", "requirement": "Water supply for camps and mining equipment"},
    {
        "section": "Tier 1",
        "requirement": "Documented support from Nations proportionately impacted by proposed activity*",
    },
    {
        "section": "Tier 1",
        "requirement": "Timeline does not confilict with minimums under applicable G2G consultation agreements",
    },

    {"section": "Tier 2", "requirement": "Temporary air strips, boat ramps, or staging areas"},
    {"section": "Tier 2", "requirement": "Camp buildings"},
    {"section": "Tier 2", "requirement": "Mechanical trenching or test pits"},
    {"section": "Tier 2", "requirement": "Bulk fuel/lubricants storage"},
    {"section": "Tier 2", "requirement": "Bridges, culverts, and crossings"},
    {"section": "Tier 2", "requirement": "Up to 50 small (20m x20m) unreclaimed at any given time"},
    {"section": "Tier 2", "requirement": "<= 5 km new exploration access construction"},
    {"section": "Tier 2", "requirement": "New stream crossings requiring QP engineered plans"},
    {"section": "Tier 2", "requirement": "Camp buildings remaining on site year-round"},
    {"section": "Tier 2", "requirement": "<= 10 km existing access modification"},
    {"section": "Tier 2", "requirement": "<= 20,000 L fuel storage"},
    {
        "section": "Tier 2",
        "requirement": "FN engagement has begun, and communities are informed of the work and application submission*",
    },
    {
        "section": "Tier 2",
        "requirement": "Timeline does not conflict with minimums under applicable G2G consultation agreements.",
    },

    {"section": "Tier 3", "requirement": "Blasting"},
    {"section": "Tier 3", "requirement": "Underground exploration"},
    {"section": "Tier 3", "requirement": "Producing regional mineral mines"},
    {"section": "Tier 3", "requirement": "Explosive magazine storage"},
    {"section": "Tier 3", "requirement": "Seismic testing using explosives"},
    {"section": "Tier 3", "requirement": "Bulk Sampling"},
    {"section": "Tier 3", "requirement": "Ore and/or waste stockpiles"},
    {"section": "Tier 3", "requirement": "Co-ordinated multiple authorizations"},
    {"section": "Tier 3", "requirement": "> 5 km new exploration access construction"},
    {"section": "Tier 3", "requirement": "> 20,000 L fuel storage"},
    {"section": "Tier 3", "requirement": "<=10,000 bulk sampling of ore"},
    {"section": "Tier 3", "requirement": "Work in a community watershed"},
    {
        "section": "Tier 3",
        "requirement": "Stream crossings or other disturbances outside of the acquired tenure",
    },
    {"section": "Tier 3", "requirement": "In area of known high cultural heritage concern"},
    {"section": "Tier 3", "requirement": "Total new disturbance >10ha"},
    {"section": "Tier 3", "requirement": "FN engagement has not commenced"},
    {"section": "Tier 3", "requirement": "FN has shown opposition to the project"},
    {
        "section": "Tier 3",
        "requirement": "Project area overlaps 5 or more FN (including Bands and other representative bodies)",
    },
]


def read_now_regional_checklist_requirements(
    include_intake_process: bool = False,
    include_group_headers: bool = False,
) -> list[dict[str, str]]:
    """Return hardcoded NOW regional checklist requirements.

    Args:
        include_intake_process: Unused (kept for backward compatibility).
        include_group_headers: Unused (kept for backward compatibility).

    Returns:
        List of requirement records with section and requirement keys.
    """
    return _CHECKLIST_REQUIREMENTS.copy()