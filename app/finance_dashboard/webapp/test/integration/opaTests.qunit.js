sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'financedashboard/test/integration/FirstJourney',
		'financedashboard/test/integration/pages/TravelRequestMain'
    ],
    function(JourneyRunner, opaJourney, TravelRequestMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('financedashboard') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheTravelRequestMain: TravelRequestMain
                }
            },
            opaJourney.run
        );
    }
);