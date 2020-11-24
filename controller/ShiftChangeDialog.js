"use strict";

sap.ui.define([
		"sap/ui/base/ManagedObject",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel"
	], function (ManagedObject,
		MessageBox, Utilities, History, JSONModel) {
		return ManagedObject.extend("com.neo.ZODHR_SS_TIME_G.controller.ShiftChangeDialog", {
			url: "/sap/opu/odata/sap/ZODHR_SS_CHANGE_HOUR_SRV/",
			consumeModel: function consumeModel(params, successCb, errorCb, urlParametersX, filter) {
				if (!this.oModel) {
					this.oModel = new sap.ui.model.odata.ODataModel(this.url);
					this.oModel.setSizeLimit(5000);
				}

				this.oModel.read(params, {
					urlParameters: urlParametersX,
					filters: filter,
					async: false,
					success: function success(oData, oResponse) {
						successCb(oData, oResponse);
					},
					error: function error(err) {
						errorCb(err);
					}

				});
			},

			onInit: function onInit() {
				this._oDialog = this.getControl();
			},

			//	--------------------------------------------
			//	fSHNovoHorario
			//	--------------------------------------------		
			fSHNovoHorario: function () {
				var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZODHR_SS_SEARCH_HELP_SRV_01/");
				var that = this;
				var oEntry = [];
				var PERNR = this.getView().byId("matricula_1").getSelectedKey();

				var oFilters = [];
				oFilters.push(new sap.ui.model.Filter("NumeroPessoal", sap.ui.model.FilterOperator.EQ, PERNR));

				this.NovoHorario = new JSONModel();
				this.NovoHorario.setSizeLimit(500);
				this.NovoHorario.setData({
					table: []
				});

				oModel.read("/ET_SH_NOVO_HORARIO", {
					filters: oFilters,
					async: false,
					success: function (oEvent) {
						for (var i = 0; i < oEvent.results.length; i++) {
							oEntry = {
								key: oEvent.results[i].SCHKZ,
								desc: oEvent.results[i].RTEXT
							};
							that.NovoHorario.getData().table.push(oEntry);

							oEntry = [];
						}
						//Seta Lista no Model da View	
						that.getView().setModel(that.NovoHorario, "novohorario");

					},

					error: function (e) {
						// MessageBox.error("Erro ao Ler anexos.");
					}
				});

				/*
								function fSuccess(oEvent) {
									for (var i = 0; i < oEvent.results.length; i++) {
										oEntry = {
											key: oEvent.results[i].SCHKZ,
											desc: oEvent.results[i].RTEXT
										};
										that.NovoHorario.getData().table.push(oEntry);

										oEntry = [];
									}
									//Seta Lista no Model da View	
									that.getView().setModel(that.NovoHorario, "novohorario");

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
								oModel.read("ET_SH_NOVO_HORARIO", null, null, false, fSuccess, fError);
				*/
			},

			changeType: "Troca Permanente",

			getNewTimeData: function getNewTimeData() {
				var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZODHR_SS_TREATED_TM_SRV/");
				var PERNR = this.getView().byId("matricula_1").getSelectedKey();
				var Schkz = this.getView().byId("hora_1");

				var oFilters = [];
				oFilters.push(new sap.ui.model.Filter("NumeroPessoal", sap.ui.model.FilterOperator.EQ, PERNR));

				oModel.read("/NovoHorarioSet", {
					filters: oFilters,
					async: false,
					success: function (oData, response) {
						var oResults = oData.results;
						for (var i = 0; i < oResults.length; i++) {
							Schkz.setValue(oResults[i].Schkz);
						}
					},
					error: function (e) {
						// MessageBox.error("Erro ao Ler anexos.");
					}
				});
			},

			getChangeTypeData: function getChangeTypeData() {
				var aData = [];
				var oData = {
					Content: "Troca Permanente"
				};
				aData.push(oData);
				oData = {
					Content: "Troca Provisória"
				};
				aData.push(oData);
				this.setChangeTypeData(aData);
			},
			setTimeData: function setTimeData(oData) {
				var json = new sap.ui.model.json.JSONModel();
				json.setData(oData);
				json.setSizeLimit(5000);

				this.getView().setModel(json, "TimeData");
			},
			setNewTimeData: function setNewTimeData(oData) {
				var json = new sap.ui.model.json.JSONModel();
				json.setData(oData);
				json.setSizeLimit(5000);

				this.getView().setModel(json, "newTimeData");
			},
			setChangeTypeData: function setChangeTypeData(oData) {
				var json = new sap.ui.model.json.JSONModel();
				json.setData(oData);
				this.getView().setModel(json, "changeTypeData");
			},
			constructor: function constructor(oView) {
				this._oView = oView;
				this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_G.view.ShiftChangeDialog", this);
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
			verifyFields: function verifyFields(matricula, horario) {
				if (matricula !== "" && horario !== "") {
					return true;
				} else {
					return false;
				}
			},
			_onInitialDateChange: function _onInitialDateChange(oEvent) {
				this.initialValue = oEvent.getSource().getValue();
			},
			_onFinalDateChange: function _onFinalDateChange(oEvent) {
				this.finalValue = oEvent.getSource().getValue();
			},
			_onNewTimeSelectionChange: function _onNewTimeSelectionChange(oEvent) {
				this.newTime = oEvent.getSource().getSelectedKey();
			},
			onChangeMatricula: function onChangeMatricula(oEvent) {
				this.getNewTimeData();
				this.fSHNovoHorario();
			},
			_onRadioButtonGroupSelect: function _onRadioButtonGroupSelect(oEvent) {
				this.changeType = oEvent.getSource().getSelectedButton().getText();

				if (this.changeType === "Troca Permanente") {
					var dependents = this._oView.getDependents();

					for (var i = 0; i < dependents.length; i++) {
						if (dependents[i].getProperty("title") === "Troca de Horário") {
							dependents[i].getContent()[0].getItems()[3].getItems()[1].setEnabled(false);
						}
					}
				} else {
					var dependents = this._oView.getDependents();

					for (var i = 0; i < dependents.length; i++) {
						if (dependents[i].getProperty("title") === "Troca de Horário") {
							dependents[i].getContent()[0].getItems()[3].getItems()[1].setEnabled(true);
						}
					}
				}
			},

			_onButtonPHTP: function _onButtonPHTP() {

				var sServiceUrl = "/sap/opu/odata/sap/ZODHR_SS_TREATED_TM_SRV/";
				var pernr = this.getView().byId("matricula_1").getSelectedKey();
				//var periodo = this.getView().byId("Periodo_1").getValue();
				var horario = this.getView().byId("novoHorario_1").getSelectedKey();
				var type = "";
				var operation = "";
				var complements = "";

				var sRead = "/ET_FORMS(FORMNAME='PHTP',PERNR='" + pernr + "',SCHKZ='" + horario + "',TYPE='" + type + "',OPERATION='" + operation +
					"',COMPLEMENTS='" + complements + "')";
				var pdfURL = sServiceUrl + sRead + "/$value";
				window.open(pdfURL);
			},

			_onButtonPress: function _onButtonPress(oEvent) {
				var matricula = this.getView().byId("matricula_1").getSelectedKey();
				var horario = this.getView().byId("novoHorario_1").getSelectedKey();
				var periodo = this.getView().byId("Periodo_1").getValue();

				var formFilled = this.verifyFields(matricula, horario);

				if (formFilled) {
					var oData = {
						initialValue: periodo,
						NovoHorario: horario,
						NumeroPessoal: matricula
					};
					this.initialValue = "";
					this.finalValue = "";
					this.newTime = "";
					this.changeType = "";

					var oEventBus = sap.ui.getCore().getEventBus();
					oEventBus.publish("ShiftChangeDialog", "ShiftChange", oData);
					this.close();
				} else {
					sap.m.MessageToast.show("Por favor preencha todos os campos", {
						duration: 3000
					});
				}
			},

			selectMatricula: function selectMatricula() {
				var pernr = sap.ui.getCore().getModel("TratamentoPonto").getSelectedPointTreatmentItems()[0].PERNR;
				this.getView().byId("Matricula").setValue(pernr);
			},

			setPeriodo: function setPeriodo() {
				var date = new Date();
				var day = date.getUTCDate();
				var month = date.getUTCMonth() + 1; //January is 0
				var year = date.getUTCFullYear();

				if (day < 21) {
					var periodo = '01' + '.' + month + '.' + year;
					this.getView().byId("Periodo_1").setValue(periodo);
				} else {
					month = month + 1;
					if (month === 13) {
						month = "01";
						year = year + 1;
					}
					var periodo1 = "01" && month && year;
					this.getView().byId("Periodo_1").setValue(periodo1);
				}
			},

			selectPermanente: function selectPermanente() {
				var dependents = this._oView.getDependents();

				for (var i = 0; i < dependents.length; i++) {
					if (dependents[i].getProperty("title") === "Troca de Horário") {
						dependents[i].getContent()[0].getItems()[1].getItems()[1].setSelectedIndex(0);
						dependents[i].getContent()[0].getItems()[3].getItems()[1].setEnabled(false);
					}
				}
			},
			open: function open() {
				this.getChangeTypeData();
				this.setPeriodo();
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
			handleRadioButtonGroupsSelectedIndex: function handleRadioButtonGroupsSelectedIndex() {
				var that = this;
				this.aRadioButtonGroupIds.forEach(function (sRadioButtonGroupId) {
					var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
					var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;

					if (oButtonsBinding) {
						var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
						var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
						oButtonsBinding.attachEventOnce("change", function () {
							if (oSelectedIndexBinding) {
								oSelectedIndexBinding.refresh(true);
							} else {
								oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
							}
						});
					}
				});
			},
			convertTextToIndexFormatter: function convertTextToIndexFormatter(sTextValue) {
				var oRadioButtonGroup = this.byId("sap_m_Dialog_1-content-sap_m_RadioButtonGroup-1538167425496");
				var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");

				if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
					// look up index in bound context
					var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
					return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function (
						oButtonContext) {
						return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
					});
				} else {
					// look up index in static items
					return oRadioButtonGroup.getButtons().findIndex(function (oButton) {
						return oButton.getText() === sTextValue;
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
			_createViewModel: function _createViewModel() {
				return new JSONModel({
					busy: ""
				});
			}
		});
	},
	/* bExport= */
	true);