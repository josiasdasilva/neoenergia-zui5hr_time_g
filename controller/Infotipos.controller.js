"use strict";

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History"], function (BaseController, MessageBox, Utilities, History) {
  "use strict";

  return BaseController.extend("com.neo.ZODHR_SS_TIME_G.controller.Infotipos", {
    handleRouteMatched: function handleRouteMatched(oEvent) {
      var sAppId = "App5ba27db1962bdb0101b893f0";
      var oParams = {};

      if (oEvent.mParameters.data.context) {
        this.sContext = oEvent.mParameters.data.context;
      } else {
        if (this.getOwnerComponent().getComponentData()) {
          var patternConvert = function patternConvert(oParam) {
            if (Object.keys(oParam).length !== 0) {
              for (var prop in oParam) {
                if (prop !== "sourcePrototype") {
                  return prop + "(" + oParam[prop][0] + ")";
                }
              }
            }
          };

          this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
        }
      }

      var oPath;

      if (this.sContext) {
        oPath = {
          path: "/" + this.sContext,
          parameters: oParams
        };
        this.getView().bindObject(oPath);
      }
    },
    _onButtonPress: function _onButtonPress() {
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
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.getTarget("Infotipos").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
    }
  });
},
/* bExport= */
true);