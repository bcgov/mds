class Contact {
  constructor(name, phone, email) {
    this.name = name;
    this.phone = phone;
    this.email = email;
  }
}

class RegionalContacts {
  constructor(region, safety, permitting, director, office) {
    this.region = region;
    this.safety = safety;
    this.permitting = permitting;
    this.director = director;
    this.office = office;
  }
}

const NE = new RegionalContacts(
  "NE",
  new Contact("Brian Oke", "(250) 565-4387", "Brian.Oke@gov.bc.ca"),
  new Contact("Marnie Fraser", "(250) 565-4206", "Marnie.Fraser@gov.bc.ca"),
  new Contact("Victor Koyanagi", "(250) 565-4323", "Victor.Koyanagi@gov.bc.ca"),
  new Contact(null, "(250) 847-7383", "MMD-Smithers@gov.bc.ca")
);

const NW = new RegionalContacts(
  "NW",
  new Contact("Doug Flynn", "(250) 847-7386", "Doug.Flynn@gov.bc.ca"),
  new Contact("Andrea Ross", "(250) 847-7768", "Andrea.Ross@gov.bc.ca"),
  new Contact("Howard Davies", "(250) 847-7653", "Howard.Davies@gov.bc.ca"),
  new Contact(null, "(250) 565-4240", "MMD-PrinceGeorge@gov.bc.ca")
);

const officeSC = new Contact(null, "(250) 371-3912", "MMD-Kamloops@gov.bc.ca");
const SC = new RegionalContacts(
  "SC",
  new Contact("Chris LeClair", "(250) 371-3714", "Chris.LeClair@gov.bc.ca"),
  officeSC, // Vacant (contact is the same as the office contact)
  new Contact("Rick Adams", "(250) 828-4583", "Rick.Adams@gov.bc.ca"),
  officeSC
);

const SE = new RegionalContacts(
  "SE",
  new Contact("Michael Dailge", "(250) 417-6141", "Michael.Daigle@gov.bc.ca"),
  new Contact("Glen Hendrickson", "(250) 417-6033", "Glen.Hendrickson@gov.bc.ca"),
  new Contact("Kathie Wagar", "(250) 417-6011", "Kathie.Wagar@gov.bc.ca"),
  new Contact(null, "(250) 417-6134", "MMD-Cranbrook@gov.bc.ca")
);

const SW = new RegionalContacts(
  "SW",
  new Contact("Jim Dunkley", "(778) 698-7294", "Jim.Dunkley@gov.bc.ca"),
  new Contact("Don Harrison", "(778) 698-7014", "Donald.Harrison@gov.bc.ca"),
  new Contact("Matthew McLean", "(778) 698-9411", "Matthew.MacLean@gov.bc.ca"),
  new Contact(null, "(778) 698-3649", "SouthwestMinesDivision@gov.bc.ca​")
);

export const MINISTRY_CONTACTS = { NE, NW, SC, SE, SW };

export const MM_OFFICE = new Contact(null, null, "PermRecl@gov.bc.ca");

export const CHIEF_INSPECTOR = new Contact(
  "Hermanus Henning",
  "(778) 974-5980",
  "hermanus.henning@gov.bc.ca"
);

export const EXEC_LEAD_AUTH = new Contact(
  "George Warnick",
  "(250) 649-4339",
  "brittanytownsend@gov.bc.ca"
);
