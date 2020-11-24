"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History"], function (ManagedObject, MessageBox, Utilities, History) {
  return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.Dialog6", {
    constructor: function constructor(oView) {
      this._oView = oView;
      this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.Dialog6", this);
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