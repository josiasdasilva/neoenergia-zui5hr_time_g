"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History", "com/neo/ZODHR_SS_TIME_G/webServices/connections"], function (ManagedObject, MessageBox, Utilities, History, connections) {
  return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.BHPopover", {
    constructor: function constructor(oView) {
      this._oView = oView;
      this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.BHPopover", this);
      this._bInit = false;
    },
    exit: function exit() {
      delete this._oView;
    },
    getView: function getView() {
      return this._oView;
    },
    getControl: function getControl() {
      return this._oControl;
    },
    getOwnerComponent: function getOwnerComponent() {
      return this._oView.getController().getOwnerComponent();
    },
    getMonthBHData: function getMonthBHData() {
      var BhPernr = this._oView.getController().BHItem.PERNR;

      var BhWerks = this._oView.getController().BHItem.WERKS;

      var stringParam = "/SaldoBhMesSet"; //?$filter=PERNR EQ '" + BHPERNR + "'";

      var aFilters = [];
      var oFilter = new sap.ui.model.Filter({
        path: "PERNR",
        operator: sap.ui.model.FilterOperator.EQ,
        value1: BhPernr
      });
      aFilters.push(oFilter);
      var oFilterWerks = new sap.ui.model.Filter({
        path: "WERKS",
        operator: sap.ui.model.FilterOperator.EQ,
        value1: BhWerks
      });
      aFilters.push(oFilterWerks);
      var me = this;
      me.getView().setBusy(true);
      this.getView().setBusy(true);
      connections.consumeModel(stringParam, function (oData, oResponse) {
        me.getView().setBusy(false);

        for (var i = 0; i < oData.results.length; i++) {
          oData.results[i].visible = true;
          oData.results[i].DT_DISPLAY = oData.results[i].DT_OCOR.substring(6, 8) + "/" + oData.results[i].DT_OCOR.substring(4, 6) + "/" + oData.results[i].DT_OCOR.substring(0, 4);
        }

        me.setMonthBHData(oData.results);
      }, function (err) {
        me.getView().setBusy(false);
        var dialog = new sap.m.Dialog({
          title: 'Erro',
          type: 'Message',
          state: 'Error',
          content: new sap.m.Text({
            text: "Não foi possível carregar os dados"
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
      }, "", aFilters); // var aData = [];
    },
    setMonthBHData: function setMonthBHData(oData) {
      var json = new sap.ui.model.json.JSONModel();
      json.setData(oData);
      this.getView().setModel(json, "monthBHData");
    },
    open: function open() {
      this.getMonthBHData();
      var oView = this._oView;
      var oControl = this._oControl;

      if (!this._bInit) {
        // Initialize our fragment
        this.onInit();
        this._bInit = true; // connect fragment to the root view of this component (models, lifecycle)

        oView.addDependent(oControl);
      }

      var args = Array.prototype.slice.call(arguments);

      if (oControl.open) {
        oControl.open.apply(oControl, args);
      } else if (oControl.openBy) {
        oControl.openBy.apply(oControl, args);
      }
    },
    close: function close() {
      this._oControl.close();
    },
    setRouter: function setRouter(oRouter) {
      this.oRouter = oRouter;
    },
    getBindingParameters: function getBindingParameters() {
      return {};
    },
    onInit: function onInit() {
      this._oDialog = this.getControl();
    },
    onExit: function onExit() {
      this._oDialog.destroy();
    }
  });
},
/* bExport= */
true);