sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/neo/ZODHR_SS_TIME_G/webServices/connections",
	"sap/ui/model/json/JSONModel"
], function (ManagedObject, MessageBox, Utilities, History, connections, JSONModel) {

	return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.Dialog5", {

		getJustificationData: function () {
			var stringParam = "/HorarioPadraoSet";
			var aFilters = [];
			var me = this;
			connections.consumeModel(
				stringParam,
				function (oData, oResponse) {
					me.setJustificationData(oData.results);
				},
				function (err) {
					sap.m.MessageToast.show("Não foi possível carregar os dados", {
						duration: 3000
					});
				}, "", aFilters
			);
		},

		constructor: function (oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.Dialog5", this);
			this._bInit = false;
			this.setValues();
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

		_onSelectTpPres: function (oEvent) {
			this.tpPresTexto = oEvent.getSource().getValue();
			this.tpPres = oEvent.getSource().getSelectedKey();
		},

		open: function () {
			var oView = this._oView;
			var oControl = this._oControl;
			this.setPeriodo();

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

		setPeriodo: function setPeriodo() {

			var data = new Date(),
				mes = (data.getMonth() + 2).toString(), //+1 pois no getMonth Janeiro começa com zero.
				mesF = (mes.length == 1) ? "0" + mes : mes,
				anoF = data.getFullYear();

			if (mesF === "13") {
				mesF = "01";
				anoF++;
			}
			var periodo = "01" + "." + mesF + "." + anoF;
			this.getView().byId("idData_5").setValue(periodo);

		},
		
		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},

		_onButtonPress: function (oEvent) {
			var matricula = this.getView().byId("idPernr_5").getSelectedKey();
			var data = this.getView().byId("idData_5").getValue();
			var horas = this.getView().byId("idHoras").getValue();
			//var tptempo = this.getView().byId("tpTempo_5").getSelectedKey();

			if (this.verifyFields(horas)) {
				var oData = {
					pernr: matricula,
					data: data,
					tpTempo: this.tpTempoTexto,
					qtHoras: horas
				};
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("TelaBancoHoras", "BancoHoras", oData);
				sap.ui.core.BusyIndicator.hide();
				this.close();
			} else {
				sap.m.MessageToast.show("Limite acima do permitido", {
					duration: 3000
				});
			}
		},

		verifyFields: function (eHoras) {

			if (eHoras > 33) {
				return false;
			}

			return true;

		},

		onInit: function () {

			this._oDialog = this.getControl();

		},

		//------------- Status --------------
		getTpTempo: function () {
			var oTempo = new JSONModel();
			oTempo.setData({
				table: [{
					Key: "0013",
					Value: "Hora Extra para BHO"
				}, {
					Key: "8713",
					Value: "EKKT- HE Pagto (BHO)"
				}]
			});
			this.getView().setModel(oTempo, "tpTempo");
		},

		_onSelectTpTempo: function (oEvent) {
			this.tpTempoTexto = oEvent.getSource().getValue();
			this.tpTempo = oEvent.getSource().getSelectedKey();
		},

		onExit: function () {
			this._oDialog.destroy();

		},

		selectMatricula: function selectMatricula() {
			var pernr = sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].PERNR;
			this.getView().byId("idPernr_5").setValue(pernr);
		},

		setValues: function () {
			this.getTpTempo();

		}

	});
}, /* bExport= */ true);