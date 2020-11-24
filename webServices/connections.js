"use strict";

sap.ui.define(["sap/ui/base/Object"], function (Object) {
	"use strict";

	var services = {
		url: "/sap/opu/odata/sap/ZODHR_SS_TREATED_TM_SRV/",
		consumeModel: function consumeModel(params, successCb, errorCb, urlParametersX, filter) {
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.url);
			oModel.read(params, {
				urlParameters: urlParametersX,
				filters: filter,
				async: false,
				success: function success(oData, oResponse) {
					successCb(oData, oResponse);
				},
				error: function error(err) {
						errorCb(err);
					} // }, this);

			});
		},
		createModel: function createModel(params, object, successCb, errorCb, urlParameters) {
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.url); // oModel.setHeaders({"X-Requested-With" : "X" });

			oModel.create(params, object, {
				urlParameters: {
					tokenHendling: false,
					disebleHeaedRequestForToken: true
				},
				//method: "PUT",
				success: function success(oData, oResponse) {
					successCb(oData, oResponse);
				},
				error: function error(err) {
					errorCb(err);
				}
			});
		},
		deleteModel: function deleteModel(params, object, successCb, errorCb, urlParameters) {
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.url); // oModel.setHeaders({"X-Requested-With" : "X" });

			oModel.remove(params, {
				urlParameters: {
					tokenHendling: false,
					disebleHeaedRequestForToken: true
				},
				//method: "PUT",
				success: function success(oData, oResponse) {
					successCb(oData, oResponse);
				},
				error: function error(err) {
					errorCb(err);
				}
			});
		},
		updateModel: function updateModel(params, object, successCb, errorCb) {
			var oModel = new sap.ui.model.odata.ODataModel(this.url, true); // oModel.setHeaders({"X-Requested-With" : "X" });

			oModel.update(params, object, {
				async: true,
				success: function success(oData, oResponse) {
					successCb(oData, oResponse);
				},
				error: function error(err) {
					errorCb(err);
				}
			});
		}
	};
	return services;
});