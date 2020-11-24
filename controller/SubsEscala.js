"use strict";

sap.ui.define([
		"sap/ui/base/ManagedObject",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"sap/m/UploadCollectionParameter",
		"./utilities",
		"sap/ui/core/routing/History",
		"com/neo/ZODHR_SS_TIME_G/webServices/connections"

	], function (ManagedObject, MessageBox, JSONModel, UploadCollectionParameter, Utilities, History, connections) {
		return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.SubsEscala", {

			onInit: function onInit() {
				this._oDialog = this.getControl();
				this.oModel = this.getOwnerComponent().getModel();
				this.fSearchHelps();
			},

			setSubsEscalaData: function setSubsEscalaData(oData) {
				var displayData = [];
				var item = sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0];

				//Ler campo "Data" da lista da tela inicial e setar nos campos "begda" e "endda" da tela SubsEscala
				var dt_ocor = sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(6, 8) + "/" +
					sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(4, 6) + "/" +
					sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(0, 4);
				this.getView().byId("begda_3").setValue(dt_ocor);
				this.getView().byId("endda_3").setValue(dt_ocor);

				if (item.TP_ZTART) {
					for (var i = 0; i < oData.length; i++) {
						if (oData[i].TP_AWART === item.TP_ZTART) {
							displayData.push(oData[i]);
						}
					}
				} else {
					displayData = oData;
				}

				var json = new sap.ui.model.json.JSONModel();
				json.setData(displayData);
				this.getView().setModel(json, "subsescalaData");
			},

			onEscalaSelect: function onEscalaSelect(oEvent) {

			},

			constructor: function constructor(oView) {
				this._oView = oView;
				this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.SubsEscala", this);
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

			setRouter: function setRouter(oRouter) {
				this.oRouter = oRouter;
			},
			getBindingParameters: function getBindingParameters() {
				return {};
			},
			verifyFields: function verifyFields(begda, endda) {
				if (begda !== "" && endda !== "") {
					return true;
				} else {
					return false;
				}
			},

			_onButtonPress: function _onButtonPress(oEvent) {
				var matricula = this.getView().byId("matricula_3").getSelectedKey();
				var inicio = this.getView().byId("begda_3").getValue();
				var dtfim = this.getView().byId("endda_3").getValue();
				var escala = this.getView().byId("escala_3").getValue().substring(0, 4);
				var formFilled = this.verifyFields(inicio, dtfim);

				if (formFilled) {
					var oData = {
						PERNR: matricula,
						BEGDA: inicio,
						ENDDA: dtfim,
						ESCALA: escala

					};

					var oEventBus = sap.ui.getCore().getEventBus();
					oEventBus.publish("SubsEscala", "SubsEscala", oData);
					this.matricula = "";
					this.inicio = "";
					this.dtfim = "";
					this.escala = "";
					this.close();
				} else {
					sap.m.MessageToast.show("Datas são obrigatórias", {
						duration: 3000
					});
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

			//	--------------------------------------------
			//	fSearchHelps
			//	--------------------------------------------		
			fSearchHelps: function () {
				var that = this;
				var oEntry = [];
				var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZODHR_SS_SEARCH_HELP_SRV_01/");

				this.Escala = new JSONModel();
				this.Escala.setSizeLimit(500);
				this.Escala.setData({
					table: []
				});

				function fSuccess(oEvent) {
					for (var i = 0; i < oEvent.results.length; i++) {
						oEntry = {
							key: oEvent.results[i].TPROG,
							desc: oEvent.results[i].TTEXT
						};
						that.Escala.getData().table.push(oEntry);

						oEntry = [];
					}
					//Seta Lista no Model da View	
					that.getView().setModel(that.Escala, "escala");

				}

				function fError(oEvent) {
					var message = $(oEvent.response.body).find('message').first().text();

					if (message.substring(2, 4) == "99") {
						var detail = ($(":contains(" + "/IWBEP/CX_SD_GEN_DPC_BUSINS" + ")", oEvent.response.body));
						var formattedDetail = detail[2].outerText.replace("/IWBEP/CX_SD_GEN_DPC_BUSINS", "");
						var zMessage = formattedDetail.replace("error", "");

						that.fVerifyAllowedUser(message, that);
						MessageBox.error(zMessage);

					} else {
						MessageBox.error(message);
					}
				}

				//MAIN READ
				oModel.read("ET_SH_ESCALA", null, null, false, fSuccess, fError);

			},

		});
	},
	/* bExport= */
	true);