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
		return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.SobreAviso", {

			onInit: function onInit() {
				this._oDialog = this.getControl();
				this.oModel = this.getOwnerComponent().getModel();
			},

			setSobreavisoData: function setSobreavisoData(oData) {
				var displayData = [];
				var item = sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0];

				//Ler campo "Data" da lista da tela inicial e setar nos campos "begda" e "endda" da tela Sobreaviso
				var dt_ocor = sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(6, 8) + "/" +
					sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(4, 6) + "/" +
					sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(0, 4);
				this.getView().byId("begda_2").setValue(dt_ocor);
				this.getView().byId("endda_2").setValue(dt_ocor);

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
				this.getView().setModel(json, "sobreavisoData");
			},

			constructor: function constructor(oView) {
				this._oView = oView;
				this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.SobreAviso", this);
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
				this.selectValores();

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
			selectValores: function () {
				this.getView().byId("plantao_2").setValue("01");
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

			_onButtonPress: function _onButtonPress(oEvent) {
				var matricula = this.getView().byId("matricula_2").getSelectedKey();
				var begda = this.getView().byId("begda_2").getValue();
				var endda = this.getView().byId("endda_2").getValue();
				var plantao = this.getView().byId("plantao_2").getValue();
				var beghour = this.getView().byId("beghour_2").getValue();
				var endhour = this.getView().byId("endhour_2").getValue();

				var formFilled = this.verifyFields(begda, endda);

				if (formFilled) {
					var oData = {
						pernr: matricula,
						begda: begda,
						endda: endda,
						plantao: plantao,
						hra_ini: beghour,
						hra_fim: endhour

					};
					var oEventBus = sap.ui.getCore().getEventBus();
					oEventBus.publish("SobreAviso", "SobreAviso", oData);
					this.matricula = "";
					this.begda = "";
					this.endda = "";
					this.beghour = "";
					this.endhour = "";
					this.close();
				} else {
					sap.m.MessageToast.show("Datas são obrigatórias", {
						duration: 3000
					});
				}
			}
		});
	},
	/* bExport= */
	true);