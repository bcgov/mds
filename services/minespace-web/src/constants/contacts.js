class Contact {
  constructor(title, name, phone, email) {
    this.title = title;
    this.name = name;
    this.phone = phone;
    this.email = email;
  }
}

class RegionalMineRegionalContacts {
  constructor(safety, permitting, director, office) {
    this.safety = safety;
    this.permitting = permitting;
    this.director = director;
    this.office = office;
  }
}

class MajorMineRegionalContacts {
  constructor(health) {
    this.health = health;
  }
}

const TITLE_SAFETY = "Senior Health, Safety and Environment Inspector";
const TITLE_PERMITTING = "Senior Permitting Inspector";
const TITLE_DIRECTOR = "Regional Director";
const TITLE_OFFICE = "Regional Office";

const REG_NE = new RegionalMineRegionalContacts(
  new Contact(TITLE_SAFETY, "Brian Oke", "(250) 565-4387", "Brian.Oke@gov.bc.ca"),
  new Contact(TITLE_PERMITTING, "Marnie Fraser", "(250) 565-4206", "Marnie.Fraser@gov.bc.ca"),
  new Contact(TITLE_DIRECTOR, "Victor Koyanagi", "(250) 565-4323", "Victor.Koyanagi@gov.bc.ca"),
  new Contact(TITLE_OFFICE, null, "(250) 565-4240", "MMD-PrinceGeorge@gov.bc.ca")
);

const REG_NW = new RegionalMineRegionalContacts(
  new Contact(TITLE_SAFETY, "Doug Flynn", "(250) 847-7386", "Doug.Flynn@gov.bc.ca"),
  new Contact(TITLE_PERMITTING, "Andrea Ross", "(250) 847-7768", "Andrea.Ross@gov.bc.ca"),
  new Contact(TITLE_DIRECTOR, "Howard Davies", "(250) 847-7653", "Howard.Davies@gov.bc.ca"),
  new Contact(TITLE_OFFICE, null, "(250) 847-7383", "MMD-Smithers@gov.bc.ca")
);

const REG_SC = new RegionalMineRegionalContacts(
  new Contact(TITLE_SAFETY, "Chris LeClair", "(250) 371-3714", "Chris.LeClair@gov.bc.ca"),
  new Contact(TITLE_PERMITTING, null, "(250) 371-3912", "MMD-Kamloops@gov.bc.ca"),
  new Contact(TITLE_DIRECTOR, "Rick Adams", "(250) 828-4583", "Rick.Adams@gov.bc.ca"),
  new Contact(TITLE_OFFICE, null, "(250) 371-3912", "MMD-Kamloops@gov.bc.ca")
);

const REG_SE = new RegionalMineRegionalContacts(
  new Contact(TITLE_SAFETY, "Michael Daigle", "(250) 417-6141", "Michael.Daigle@gov.bc.ca"),
  new Contact(TITLE_PERMITTING, "Glen Hendrickson", "(250) 417-6033", "Glen.Hendrickson@gov.bc.ca"),
  new Contact(TITLE_DIRECTOR, "Kathie Wagar", "(250) 417-6011", "Kathie.Wagar@gov.bc.ca"),
  new Contact(TITLE_OFFICE, null, "(250) 417-6134", "MMD-Cranbrook@gov.bc.ca")
);

const REG_SW = new RegionalMineRegionalContacts(
  new Contact(TITLE_SAFETY, "Jim Dunkley", "(778) 698-7294", "Jim.Dunkley@gov.bc.ca"),
  new Contact(TITLE_PERMITTING, "Don Harrison", "(778) 698-7014", "Donald.Harrison@gov.bc.ca"),
  new Contact(TITLE_DIRECTOR, "Matthew McLean", "(778) 698-9411", "Matthew.MacLean@gov.bc.ca"),
  new Contact(TITLE_OFFICE, null, "(778) 698-3649", "SouthwestMinesDivision@gov.bc.ca​")
);

export const REGIONAL_MINE_REGIONAL_CONTACTS = {
  NE: REG_NE,
  NW: REG_NW,
  SC: REG_SC,
  SE: REG_SE,
  SW: REG_SW,
};

const TITLE_HEALTH = "Health and Safety Inspector";

const MAJ_NE = new MajorMineRegionalContacts(
  new Contact(TITLE_HEALTH, "Kristopher Bailey", "(250) 565-4271", "Kristopher.Bailey@gov.bc.ca")
);

const MAJ_NW = new MajorMineRegionalContacts(
  new Contact(TITLE_HEALTH, "Megan Frederick", "(250) 847-7214", "Megan.Frederick@gov.bc.ca")
);

const MAJ_SC = new MajorMineRegionalContacts(
  new Contact(TITLE_HEALTH, "Blythe Golobic", "(250) 371-3915", "Blythe.Golobic@gov.bc.ca")
);

const MAJ_SE = new MajorMineRegionalContacts(
  new Contact(TITLE_HEALTH, "Alan Day", "(250) 417-6013", "Alan.Day@gov.bc.ca")
);

const MAJ_SW = new MajorMineRegionalContacts(
  new Contact(TITLE_HEALTH, "Blythe Golobic", "(250) 371-3915", "Blythe.Golobic@gov.bc.ca")
);

export const MAJOR_MINE_REGIONAL_CONTACTS = {
  NE: MAJ_NE,
  NW: MAJ_NW,
  SC: MAJ_SC,
  SE: MAJ_SE,
  SW: MAJ_SW,
};

export const MM_OFFICE = new Contact("Major Mines Office", null, null, "PermRecl@gov.bc.ca");

export const CHIEF_INSPECTOR = new Contact(
  "Chief Inspector of Mines",
  "Hermanus Henning",
  "(778) 974-5980",
  "hermanus.henning@gov.bc.ca"
);

export const EXEC_LEAD_AUTH = new Contact(
  "Executive Lead (Authorizations)",
  "George Warnock",
  "(250) 649-4339",
  "brittanytownsend@gov.bc.ca"
);
