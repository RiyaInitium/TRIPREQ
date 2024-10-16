sap.ui.define(['sap/fe/core/PageController', 'sap/m/MessageBox'], function (PageController, MessageBox) {
  'use strict';
  // @ts-ignore
  const { ajax } = $;
  let localModel, oView, ID, serviceUrl;
  return PageController.extend('financedashboard.ext.main.Main', {
    onInit: function () {
      localModel = new sap.ui.model.json.JSONModel({
        editable: true,
        financeApprove: true,
        financeComments: '',
      });

      this.getAppComponent()
        .getRouter(this)
        .getRoute('TravelRequestDetail')
        .attachPatternMatched(this._onDetailMatched, this);
      oView = this.getView();
      oView.setModel(localModel, 'localModel');
      serviceUrl = this.getAppComponent().getModel().getServiceUrl();
    },

    onEmail: function (oEvent) {
      window.open('mailto:' + oEvent.getSource().getText());
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

    _onDetailMatched: function (oEvent) {
      ID = oEvent.getParameter('arguments').ID;
      const idObjectPageLayout = oView.byId('idObjectPageLayout');
      oView.setBusy(true);
      idObjectPageLayout.bindElement('/TravelRequest(' + ID + ')');
      setTimeout(function () {
        oView.setBusy(false);
      }, 1000);

      ajax({
        method: 'GET',
        url: serviceUrl + `TravelRequest(${ID})/financenotes/$value`,
        success: function (financenotes) {
          localModel.setProperty('/financeComments', financenotes || '');
        },
        error: console.error,
      });
    },

    onApproveReject: function (oEvent) {
      const { financeComments: financenotes } = localModel.getData(),
        isApproved = oEvent.getSource().getText() === 'Approve',
        { REQID, emailid, firstname, empid } = oView.byId('idObjectPageLayout').getBindingContext().getObject();

      if (!financenotes) {
        MessageBox.error('Please add finance comments');
        return;
      }

      MessageBox.confirm(`Are you sure you want to ${isApproved ? 'approve' : 'reject'} this travel request?`, {
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.OK) {
            ajax({
              method: 'POST',
              url: serviceUrl + 'updateRequest',
              headers: {
                'Content-Type': 'application/json',
              },
              data: JSON.stringify({
                REQID,
                reqstatus: isApproved ? 'ApprovedF' : 'RejectedF',
                financenotes,
                emailid,
                firstname,
                empid,
              }),
              success: function () {
                MessageBox.success('State Updated', {
                  onClose: function () {
                    window.history.go(-1);
                  },
                });
              },
              error: console.error,
            });
          }
        }.bind(this),
      });
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
        case 'RejectedM':
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
        case 'RejectedM':
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

    _onGetDaysLeftFromToday: function (date) {
      if (!date) {
        return '0';
      }

      const today = new Date();
      const diff = (-today.getTime() + new Date(date).getTime()) / (1000 * 60 * 60 * 24);
      return Math.ceil(diff);
    },
  });
});
