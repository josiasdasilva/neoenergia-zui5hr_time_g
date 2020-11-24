sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/neo/ZODHR_SS_TIME_G/webServices/connections",
	"sap/ui/model/json/JSONModel"
], function (ManagedObject, MessageBox, Utilities, History, connections, JSONModel) {

	return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.Dialog4", {

		getTipoRemurData: function () {
			var stringParam = "/TipoRemuneracaoSet";
			var aFilters = [];
			var me = this;
			connections.consumeModel(
				stringParam,
				function (oData, oResponse) {
					me.setRemurData(oData.results);
				},
				function (err) {
					sap.m.MessageToast.show("Não foi possível carregar os dados", {
						duration: 3000
					});
				}, "", aFilters
			);
		},

		setRemurData: function (oData) {

			var displayData = [];
			for (var i = 0; i < oData.length; i++) {
				displayData.push(oData[i]);
			}

			var json = new sap.ui.model.json.JSONModel();
			json.setData(displayData);
			this.getView().setModel(json, "tpRemurData");
		},

		constructor: function (oView) {

			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.Dialog4", this);
			this._bInit = false;
			this.setValues();
		},

		exit: function () {
			delete this._oView;
		},

		getView: function () {
			return this._oView;
		},

		getControl: function () {
			return this._oControl;
		},

		getOwnerComponent: function () {
			return this._oView.getController().getOwnerComponent();
		},

		open: function () {

			var oView = this._oView;
			var oControl = this._oControl;

			this.getTipoRemurData();
			//this.selectMatricula();

			if (!this._bInit) {

				// Initialize our fragment
				this.onInit();

				this._bInit = true;

				// connect fragment to the root view of this component (models, lifecycle)
				oView.addDependent(oControl);
			}

			var args = Array.prototype.slice.call(arguments);
			if (oControl.open) {
				oControl.open.apply(oControl, args);
			} else if (oControl.openBy) {
				oControl.openBy.apply(oControl, args);
			}
		},

		onAfterCloseDialog: function onAfterCloseDialog(oEvent) {},

		_onButtonPress1: function _onButtonPress1() {
			this.close();
		},

		close: function close() {
			this.limparCampos();
			this._oControl.close();
			//this._oDialog.destroy();

		},

		limparCampos: function limparCampos() {},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},

		getTpPres: function () {
			var oPres = new JSONModel();
			oPres.setData({
				table: [{
					Key: "0801",
					Value: "Horas Extras"
				}]
			});
			this.getView().setModel(oPres, "tpPres");
		},

		_onSelectTpPres: function _onSelectJustification(oEvent) {
			this.tpPresTexto = oEvent.getSource().getValue();
			this.tpPres = oEvent.getSource().getSelectedKey();
		},

		_onSelectTpRemur: function _onSelectJustification(oEvent) {
			this.tpRemurTexto = oEvent.getSource().getValue();
			this.tpRemur = oEvent.getSource().getSelectedKey();
		},

		_onButtonPress: function (oEvent) {
			var matricula = this.getView().byId("idPernr_4").getSelectedKey();
			var data = this.getView().byId("idData_4").getValue();
			var hrsAte = this.getView().byId("idHrsAte").getValue();
			var hrsDe = this.getView().byId("idHrsDe").getValue();

			if (this.getView().byId("idDiaAnt").getSelected()) {
				var diaAnt = 'X';
			}

			var formFilled = this.verifyFields(data, hrsAte, hrsDe);

			data = data.replaceAll("-", "");

			if (formFilled) {
				var oData = {
					Pernr: matricula,
					Data: data,
					Vtken_From: hrsDe,
					Vtken_To: hrsAte,
					Dia_ant: diaAnt,
					Tp_Presenca: this.tpPres,
					tpRemurTexto: this.tpRemurTexto,
					tpRemur: this.tpRemur
				};
				//sap.ui.core.BusyIndicator.show();
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("TelaHorasExtras", "HorasExtras", oData);
				sap.ui.core.BusyIndicator.hide();
				this.close();
			} else {
				sap.m.MessageToast.show("Selecione o Tipo de Remuneração", {
					duration: 3000
				});
			}
		},

		verifyFields: function (eData, eHrsAte, eHrsDe) {

			/*	if(this.tpRemurTexto || eData || eHrsAte || eHrsDe){
					return false;
				}	*/

			return true;
		},

		onInit: function () {

			this._oDialog = this.getControl();

		},

		selectMatricula: function () {
			var pernr = sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].PERNR;
			this.getView().byId("idPernr_4").setValue(pernr);
		},

		setValues: function () {
			this.getTpPres();

		}

	});
}, /* bExport= */ true);