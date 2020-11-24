"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History"], function (ManagedObject, MessageBox, Utilities, History) {
  return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.HolidayChangeDialog", {
    constructor: function constructor(oView) {
      this._oView = oView;
      this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.HolidayChangeDialog", this);
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
    open: function open() {
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
    verifyFields: function verifyFields() {
      if (this.initialValue && this.finalValue) {
        return true;
      } else {
        return false;
      }
    },
    _onInitialDateChange: function _onInitialDateChange(oEvent) {
      this.initialValue = oEvent.getSource().getValue();
    },
    _onFinalDateChange: function _onFinalDateChange(oEvent) {
      this.finalValue = oEvent.getSource().getValue();
    },
    _onButtonPress: function _onButtonPress(oEvent) {
      var formFilled = this.verifyFields();

      if (formFilled) {
        var oData = {
          initialValue: this.initialValue,
          finalValue: this.finalValue
        };
        this.initialValue = "";
        this.finalValue = "";

        var dependents = this._oView.getDependents();

        for (var i = 0; i < dependents.length; i++) {
          if (dependents[i].getProperty("title") === "Troca de Feriado") {
            dependents[i].getContent()[0].getItems()[0].getItems()[1].setValue("");
            dependents[i].getContent()[0].getItems()[1].getItems()[1].setValue("");
          }
        }

        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("HolidayChangeDialog", "HolidayChange", oData);
        this.close();
      } else {
        sap.m.MessageToast.show("Selecione as datas", {
          duration: 3000
        });
      }
    },
    _onButtonPress1: function _onButtonPress1() {
      this.initialValue = "";
      this.finalValue = "";

      var dependents = this._oView.getDependents();

      for (var i = 0; i < dependents.length; i++) {
        if (dependents[i].getProperty("title") === "Troca de Feriado") {
          dependents[i].getContent()[0].getItems()[0].getItems()[1].setValue("");
          dependents[i].getContent()[0].getItems()[1].getItems()[1].setValue("");
        }
      }

      this.close();
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