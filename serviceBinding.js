function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZODHR_SS_SEARCH_HELP_SRV_01/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}