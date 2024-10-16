using {travelreq as my} from '../db/schema';

service TravelApp @(path: '/employee') {
    entity TravelRequest   as projection on my.TravelRequest;

    entity EmpInfo         as projection on my.EMPINFO
                              where
                                  empemail = 'Riya.Tickoo@initiumdigital.com';

    entity DepartureCity   as projection on my.citytable;
    entity DestinationCity as projection on my.citytable;
    action   getData()                                                 returns String;
    action   DocExtract(content : array of Integer, filename : String) returns String;
    function GetExtract(id : String)                                   returns String;
    entity Docextraction   as projection on my.Docextraction;
}

service ManagerApp @(path: '/manager') @(impl: './manager.js') {


    action updateRequest(REQID : Integer,
                         reqstatus : String(20),
                         mgrnotes : String(5000),
                         empid : String(20),
                         firstname : String(50),
                         emailid : String(100)) returns String;

    entity TravelRequest   as projection on my.TravelRequest;
    entity DepartureCity   as projection on my.citytable;
    entity DestinationCity as projection on my.citytable;

}

service FinanceApp @(path: '/finance') @(impl: './finance.js') {
    action updateRequest(REQID : Integer,
                         reqstatus : String(20),
                         financenotes : String(5000),
                         empid : String(20),
                         firstname : String(50),
                         emailid : String(100)) returns String;

    entity TravelRequest   as projection on my.TravelRequest;
    entity DepartureCity   as projection on my.citytable;
    entity DestinationCity as projection on my.citytable;

}
