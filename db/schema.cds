using {
    cuid,
    managed
} from '@sap/cds/common'; // importing aspects to be used in the schema

namespace travelreq;

extend managed with {
    isdel : Boolean default false; // extended the managed aspect to include isdel feild
}


entity TravelRequest : cuid, managed {
    key ID                 : UUID;
        REQID              : Integer;
        ReqNo              : String(30);
        empid              : String(20);
        firstname          : String(50);
        lastname           : String(50);
        dob                : Date;
        dept               : String(250);
        emergencycontactno : String(20);
        mobno              : String(20);
        emailid            : String(100);
        address            : String(250);
        mgrid              : String(20);
        mgrname            : String(100);
        mgremail           : String(100);
        mgrcontact         : String(20);
        reqstatus          : String(20) default 'PendingM';
        travelpreference   : Integer;
        traveltype         : Integer;
        purposeoftravel    : String(500);
        departcity         : String(20);
        destcity           : String(20);
        triptype           : Integer;
        departdate         : Date;
        returndate         : Date;
        accomodation       : Integer;
        accpreference      : String(500);
        empnotes           : String(5000);
        mgrnotes           : String(500);
        financenotes       : String(5000);
        adminnotes         : String(5000);
        statusflag         : String(1) default '1';
        Dextract           : Composition of many Docextraction
                                 on Dextract.Treq = $self;
}


entity EMPINFO {
   key empid       : String(10); // Employee ID
    firstname   : String(50); // First Name
    lastname    : String(50); // Last Name
    dob         : Date; // Date of Birth
    designation : String(50); // Designation
    dept        : String(50); // Department
    subdept     : String(50); // Sub-Department
    address     : String(255); // Address
    mgrid       : String(10); // Manager ID
    mgrname     : String(50); // Manager Name
    empemail    : String(100); // Employee Email
    mgremail    : String(100); // Manager Email
    mgrcontact  : String(15); // Manager Contact
}


entity citytable : managed {
    key cityname  : String(50);
    latitude  : Decimal(10, 7);
    longitude : Decimal(10, 7);
}


entity Docextraction : cuid, managed {
    key ID          : UUID;
        exname      : String(100);
        category    : String(1000);
        value       : String(500);
        type        : String(100);
        label       : String(100);
        description : String(1000);
        Treq        : Association to TravelRequest;
}
