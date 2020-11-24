"use strict";

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "./utilities", "sap/ui/core/routing/History"], function (BaseController, MessageBox, Utilities, History) {
  "use strict";

  return BaseController.extend("com.neo.ZODHR_SS_TIME_G.controller.EditarMarcacao", {
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
    _onButtonPress: function _onButtonPress(oEvent) {
      oEvent = jQuery.extend(true, {}, oEvent);
      return new Promise(function (fnResolve) {
        fnResolve(true);
      }).then(function (result) {
        var oBindingContext = oEvent.getSource().getBindingContext();
        return new Promise(function (fnResolve) {
          this.doNavigate("TratamentoDoPonto", oBindingContext, fnResolve, "");
        }.bind(this));
      }.bind(this)).then(function (result) {
        if (result === false) {
          return false;
        } else {
          return new Promise(function (fnResolve) {
            var sTargetPos = "center top";
            sTargetPos = sTargetPos === "default" ? undefined : sTargetPos;
            sap.m.MessageToast.show("Dados salvos com sucesso", {
              onClose: fnResolve,
              duration: 3000 || 3000,
              at: sTargetPos,
              my: sTargetPos
            });
          });
        }
      }.bind(this))["catch"](function (err) {
        if (err !== undefined) {
          MessageBox.error(err.message);
        }
      });
    },
    doNavigate: function doNavigate(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
      var sPath = oBindingContext ? oBindingContext.getPath() : null;
      var oModel = oBindingContext ? oBindingContext.getModel() : null;
      var sEntityNameSet;

      if (sPath !== null && sPath !== "") {
        if (sPath.substring(0, 1) === "/") {
          sPath = sPath.substring(1);
        }

        sEntityNameSet = sPath.split("(")[0];
      }

      var sNavigationPropertyName;
      var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

      if (sEntityNameSet !== null) {
        sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
      }

      if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
        if (sNavigationPropertyName === "") {
          this.oRouter.navTo(sRouteName, {
            context: sPath,
            masterContext: sMasterContext
          }, false);
        } else {
          oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
            if (bindingContext) {
              sPath = bindingContext.getPath();

              if (sPath.substring(0, 1) === "/") {
                sPath = sPath.substring(1);
              }
            } else {
              sPath = "undefined";
            } // If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build


            if (sPath === "undefined") {
              this.oRouter.navTo(sRouteName);
            } else {
              this.oRouter.navTo(sRouteName, {
                context: sPath,
                masterContext: sMasterContext
              }, false);
            }
          }.bind(this));
        }
      } else {
        this.oRouter.navTo(sRouteName);
      }

      if (typeof fnPromiseResolve === "function") {
        fnPromiseResolve();
      }
    },
    _onButtonPress1: function _onButtonPress1(oEvent) {
      var oBindingContext = oEvent.getSource().getBindingContext();
      return new Promise(function (fnResolve) {
        this.doNavigate("TratamentoDoPonto", oBindingContext, fnResolve, "");
      }.bind(this))["catch"](function (err) {
        if (err !== undefined) {
          MessageBox.error(err.message);
        }
      });
    },
    onInit: function onInit() {
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.getTarget("EditarMarcacao").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
    }
  });
},
/* bExport= */
true);