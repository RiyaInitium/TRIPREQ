sap.ui.define(
  ['sap/fe/core/PageController', 'sap/m/MessageToast', 'sap/ui/export/Spreadsheet', 'sap/ui/model/json/JSONModel'],
  function (PageController, MessageToast, Spreadsheet, JSONModel) {
    'use strict';
    // @ts-ignore
    const { ajax } = $;
    let localModel, oView;
    return PageController.extend('financedashboard.ext.main.Main', {
      onInit: function () {
        localModel = new JSONModel({
          KPI: [
            {
              header: 'Pending Approvals',
              subHeader: 'Pending',
              value: 0,
              valueColor: 'Critical',
            },
            {
              header: 'Approved Requests',
              subHeader: 'Approved',
              value: 0,
              valueColor: 'Good',
            },
            {
              header: 'Rejected Requests',
              subHeader: 'Rejected',
              value: 0,
              valueColor: 'Error',
            },
          ],
        });
        oView = this.getView();
        oView.setModel(localModel, 'localModel');
        this.getAppComponent()
          .getRouter(this)
          .getRoute('TravelRequestMain')
          .attachPatternMatched(this._onMainMatched, this);
      },

      onAfterRendering: function () {},

      _onFetchTableAndKPI: function () {
        const serviceUrl = this.getOwnerComponent().getModel().getServiceUrl(),
          { KPI } = localModel.getData(),
          calls = KPI.map(function (kpi) {
            return ajax({
              method: 'GET',
              url: `${serviceUrl}TravelRequest/$count?$filter=startswith(reqstatus,'${kpi.subHeader}')`,
            });
          });
        oView.setBusy(true);
        // @ts-ignore
        Promise.all(calls)
          .then(function (oResponse) {
            localModel.setProperty(
              '/KPI',
              KPI.map(function (oKPI, i) {
                oKPI.value = oResponse[i];
                return oKPI;
              })
            );
          })
          .catch(console.error)
          .finally(function () {
            oView.setBusy(false);
          });

        oView.byId('idTable').getBinding('items').refresh();
      },

      _onMainMatched: function () {
        this._onFetchTableAndKPI();
      },

      onShare: function () {
        const sCurrentUrl = window.location.href,
          sSubject = 'Check out this Travel Plan!',
          sBody = 'Hi,\n\nI found this interesting travel plan. Check it out: ' + sCurrentUrl,
          oLink = document.createElement('a'),
          sMailtoLink = 'mailto:?subject=' + encodeURIComponent(sSubject) + '&body=' + encodeURIComponent(sBody);

        oLink.href = sMailtoLink;
        oLink.click();
      },

      onExport: function (sType) {
        const oTable = this.getView().byId('idTable');

        if (sType === 'CSV') {
          // @ts-ignore
          sap.ui.core.util.File.save(
            [
              'Request No.,Employee Name,Department,Travel Purpose,Travel Status',
              ...oTable.getItems().map((items) => {
                return items
                  .getCells()
                  .map((cells) => `"${cells.getText()}"`)
                  .join(',');
              }),
            ].join('\n'),
            'TravelPlans',
            'csv',
            'text/csv',
            true
          );
        } else if (sType === 'XLSX') {
          const aCols = [
              { label: 'Request No.', property: 'REQID', type: 'string' },
              { label: 'Employee Name', property: ['firstname', 'lastname'], type: 'string' },
              { label: 'Department', property: 'dept', type: 'string' },
              { label: 'Travel Purpose', property: 'purposeoftravel', type: 'string' },
              { label: 'Travel Status', property: 'reqstatus', type: 'string' },
            ],
            oSettings = {
              workbook: { columns: aCols, hierarchyLevel: 'Level' },
              dataSource: oTable.getBinding('items'),
              fileName: 'TravelPlans.xlsx',
              worker: false,
            },
            oSpreadsheet = new Spreadsheet(oSettings);

          oSpreadsheet
            .build()
            .then(function () {
              MessageToast.show('Spreadsheet export has finished successfully.');
            })
            .catch(function (oError) {
              MessageToast.show('Error when downloading spreadsheet. ' + oError);
            })
            .finally(function () {
              oSpreadsheet.destroy();
            });
        }
      },

      onNavigate: function (oEvent) {
        const oRouter = this.getAppComponent().getRouter(this),
          ID = oEvent.getSource().getBindingContext().getObject('ID');
        oRouter.navTo('TravelRequestDetail', {
          ID,
        });
      },

      onExit: function () {
        clearInterval(this._RefreshInterval);
      },

      _onFormatState: function (reqstatus) {
        if (!reqstatus) {
          return;
        }

        switch (reqstatus) {
          case 'ApprovedF':
          case 'ApprovedM':
            return 'Success';
          case 'RejectedF':
            return 'Error';
          case 'Completed':
            return 'Success';
          default:
            return 'Warning';
        }
      },

      _onFormatStateIcon: function (reqstatus) {
        if (!reqstatus) {
          return;
        }

        switch (reqstatus) {
          case 'ApprovedF':
          case 'ApprovedM':
            return 'sap-icon://accept';
          case 'RejectedF':
            return 'sap-icon://error';
          case 'Completed':
            return 'sap-icon://completed';
          default:
            return 'sap-icon://pending';
        }
      },

      _onFormatStateText: function (reqstatus) {
        if (!reqstatus) {
          return;
        }

        switch (reqstatus) {
          case 'ApprovedF':
          case 'ApprovedM':
            return 'Approved';
          case 'RejectedF':
          case 'RejectedM':
            return 'Rejected';
          case 'Completed':
            return 'Completed';
          default:
            return 'Pending';
        }
      },
    });
  }
);
