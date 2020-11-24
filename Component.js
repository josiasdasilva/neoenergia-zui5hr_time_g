"use strict";

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "com/neo/ZODHR_SS_TIME_G/model/models"], function (UIComponent, Device,
	models) {
	"use strict";

	var navigationWithContext = {};
	return UIComponent.extend("com.neo.ZODHR_SS_TIME_G.Component", {
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function init() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments); // set the device model

			this.setModel(models.createDeviceModel(), "device");
			this.getRouter().initialize();
		},
		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		createContent: function createContent() {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";

			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},
		getNavigationPropertyForNavigationWithContext: function getNavigationPropertyForNavigationWithContext(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}
	});
});