"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History", "com/neo/ZODHR_SS_TIME_G/webServices/connections"], function (ManagedObject, MessageBox, Utilities, History, connections) {
  return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.StandardTimeDialog", {
    onAfterCloseDialog: function onAfterCloseDialog(oEvent) {
      this._oDialog.getContent()[0].setValue("");

      this.selectedReason = null;
    },

    getReasonData: function getReasonData() {
      var stringParam = "/HorarioPadraoSet";
      var aFilters = [];
      var me = this;
      connections.consumeModel(stringParam, function (oData, oResponse) {
        me.setReasonData(oData.results);
      }, function (err) {
        sap.m.MessageToast.show("Não foi possível carregar os dados", {
          duration: 3000
        });
      }, "", aFilters); 
    },
    setReasonData: function setReasonData(oData) {
      var json = new sap.ui.model.json.JSONModel();
      json.setData(oData);
      this.getView().setModel(json, "reasonData");
    },
    constructor: function constructor(oView) {
      this._oView = oView;
      this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.StandardTimeDialog", this);
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
      this.getReasonData();
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
      if (this.selectedReason) {
        return true;
      } else {
        return false;
      }
    },
    _onReasonSelectionChange: function _onReasonSelectionChange(oEvent) {
      this.selectedReason = oEvent.getSource().getSelectedKey();
      this.selectedReasonText = oEvent.getSource().getValue();
    },
    _onButtonPress: function _onButtonPress(oEvent) {
      var formFilled = this.verifyFields();

      if (formFilled) {
        var oData = {
          selectedReason: this.selectedReason,
          selectedReasonText: this.selectedReasonText
        };

        var dependents = this._oView.getDependents();

        for (var i = 0; i < dependents.length; i++) {
          if (dependents[i].getProperty("title") === "Motivo Nova Marcação") {
            dependents[i].getContent()[0].setValue("");
            dependents[i].getContent()[0].setSelectedKey("");
          }
        }

        this.selectedReason = "";
        this.selectedReasonText = "";
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.publish("StandardTimeDialog", "StandardTime", oData);
        this.close();
      } else {
        sap.m.MessageToast.show("Selecione o motivo", {
          duration: 3000
        });
      }
    },
    _onButtonPress1: function _onButtonPress1() {
      var dependents = this._oView.getDependents();

      for (var i = 0; i < dependents.length; i++) {
        if (dependents[i].getProperty("title") === "Motivo Nova Marcação") {
          dependents[i].getContent()[0].setValue("");
          dependents[i].getContent()[0].setSelectedKey("");
        }
      }

      this.selectedReason = "";
      this.selectedReasonText = "";
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