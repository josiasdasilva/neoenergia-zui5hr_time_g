"use strict";

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History", "com/neo/ZODHR_SS_TIME_G/webServices/connections"], function (BaseController, MessageBox, Utilities, History, connections) {
  "use strict";

  return BaseController.extend("com.neo.ZODHR_SS_TIME_G.controller.PlanoHorario", {
    getHoursPlanData: function getHoursPlanData(contextP, contextW, contextM) {
      var stringParam = "/DetalhePlanoHorSet";
      var aFilters = [];
      var oFilter = new sap.ui.model.Filter({
        path: "PERNR",
        operator: sap.ui.model.FilterOperator.EQ,
        value1: contextP
      });
      aFilters.push(oFilter);
      oFilter = new sap.ui.model.Filter({
        path: "WERKS",
        operator: sap.ui.model.FilterOperator.EQ,
        value1: contextW
      });
      aFilters.push(oFilter);
      oFilter = new sap.ui.model.Filter({
        path: "MOFID",
        operator: sap.ui.model.FilterOperator.EQ,
        value1: contextM
      });
      aFilters.push(oFilter);
      var me = this;
      connections.consumeModel(stringParam, function (oData, oResponse) {
        for (var i = 0; i < oData.results.length; i++) {
          oData.results[i].DATUM = oData.results[i].DATUM.substring(6, 8) + "/" + oData.results[i].DATUM.substring(4, 6) + "/" + oData.results[i].DATUM.substring(0, 4);
        }

        me.setHoursPlanData(oData.results);
      }, function (err) {
        sap.m.MessageToast.show("Não foi possível carregar os dados", {
          duration: 3000
        });
      }, "", aFilters); 
    },
    setHoursPlanData: function setHoursPlanData(oData) {
      var json = new sap.ui.model.json.JSONModel();
      json.setData(oData);
      this.getView().setModel(json, "hoursPlanData");
    },
    _onPageNavButtonPress: function _onPageNavButtonPress() {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();
      var oQueryParams = this.getQueryParameters(window.location);

      if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
        window.history.go(-1);
      } else {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("default", true);
      }
    },
    getQueryParameters: function getQueryParameters(oLocation) {
      var oQuery = {};
      var aParams = oLocation.search.substring(1).split("&");

      for (var i = 0; i < aParams.length; i++) {
        var aPair = aParams[i].split("=");
        oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
      }

      return oQuery;
    },
    onInit: function onInit() {
      //registering warning of landscape mode
      sap.ui.Device.orientation.attachHandler(function (oEvt) {
        if (sap.ui.Device.orientation.landscape) {
          var dialog = new sap.m.Dialog({
            title: 'Aviso smartphone na horizontal',
            type: 'Message',
            state: 'Warning',
            content: new sap.m.Text({
              text: 'Esse aplicativo foi desenvolvido para funcionamento em formato vertical,' + ' para o modo horizontal algumas informações serão sobrecarregadas'
            }),
            beginButton: new sap.m.Button({
              text: 'OK',
              press: function press() {
                dialog.close();
              }
            }),
            afterClose: function afterClose() {
              dialog.destroy();
            }
          });
          dialog.open();
        }
      });
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.getTarget("PlanoHorario").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
    },
    handleRouteMatched: function handleRouteMatched(oEvent) {
      if (oEvent.getParameter("data").contextpath) {
        var contextP = oEvent.getParameter("data").contextpath.split(",")[0];
        var contextW = oEvent.getParameter("data").contextpath.split(",")[1];
        var contextM = oEvent.getParameter("data").contextpath.split(",")[2];
        this.getHoursPlanData(contextP, contextW, contextM);
      } else {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("TratamentoDoPonto");
      }
    }
  });
},
/* bExport= */
true);