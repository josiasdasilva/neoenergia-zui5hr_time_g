"use strict";

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/Text",
  "sap/m/ObjectStatus",
  "./BHPopover",
  "./JustificationDialog",
  "./TelaEditarMarcacoes",
  "./ExcluirMarcacoes",
  "./StandardTimeDialog",
  "./HolidayChangeDialog",
  "./ShiftChangeDialog",
  "./Dialog4",
  "./Dialog5",
  "./SobreAviso",
  "./SubsEscala",
  "./utilities",
  "sap/ui/core/routing/History",
  "sap/m/MessageToast",
  "com/neo/ZODHR_SS_TIME_G/webServices/connections"
], function (Controller, MessageBox, Text, ObjectStatus, Popover2, JustificationDialog, TelaEditarMarcacoes, ExcluirMarcacoes, Dialog7, Dialog2, Dialog3,
  Dialog4, Dialog5, SobreAviso, SubsEscala, Utilities, Historyr, MessageToast, connections) {
    "use strict";
    
    return Controller.extend("com.neo.ZODHR_SS_TIME_G.controller.TratamentoDoPonto", {
      table: "",
      onClearAllFilter: function onClearAllFilter(oEvent) {
        for (var i = 0; i < oEvent.getParameters().selectionSet.length; i++) {
          oEvent.getParameters().selectionSet[i].setValue('');
        }
      },
      doNothing: function doNothing() { //do nothing
      },
      reloadAppData: function reloadAppData(oData) {
        sap.ui.core.BusyIndicator.hide();
        
        if (oData) {
          if (oData.headers.location.includes("TratamentoSet")) {
            var dialog = new sap.m.Dialog({
              title: 'Successo',
              type: 'Message',
              state: 'Success',
              content: new sap.m.Text({
                text: 'Marcações Realizadas com sucesso!'
              }),
              beginButton: new sap.m.Button({
                text: 'OK',
                press: function press() {
                  dialog.close();
                }
              }),
              afterClose: function afterClose() {
                dialog.destroy();
              }
            });
            dialog.open();
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("TelaEditarMarcacoes", "MarksSaved", true);
          }
        }
        
        this.getPointOcurrencyData();
      },
      
      onFormataAData: function onFormataAData(dataSAP) {
        var dataFormatada = dataSAP.substring(6, 8) + "/" + dataSAP.substring(4, 6) + "/" + dataSAP.substring(0, 4);
        return dataFormatada;
      },
      sendCreateModel: function sendCreateModel(obj, param) {
        var me = this;
        this.getView().setBusy(true);
        connections.createModel(param, obj, function (oData, oResponse) {
          me.getView().setBusy(false);
          sap.ui.core.BusyIndicator.hide();
          
          if (oResponse.headers.location.includes("CabecalhoTrocarHorarioSet")) {
            if (!oData.Wf) {
              var errors = "";
              delete oData.__metadata;
              oData.TrocarHorarioSet = oData.TrocarHorarioSet.results;
              
              if (oData.TrocarHorarioSet.length) {
                for (var i = 0; i < oData.TrocarHorarioSet.length; i++) {
                  delete oData.TrocarHorarioSet[i].__metadata;
                  
                  if (oData.TrocarHorarioSet.length === 1) {
                    if (oData.TrocarHorarioSet[i].Error && oData.TrocarHorarioSet[i].CallWF) {
                      errors = errors + ", " + oData.TrocarHorarioSet[i].NumeroPessoal + " - " + oData.TrocarHorarioSet[i].Nome + ": " + oData.TrocarHorarioSet[
                        i].Error;
                      }
                    } else {
                      if (oData.TrocarHorarioSet[i].Error && oData.TrocarHorarioSet[i].CallWF) {
                        errors = errors + ", " + oData.TrocarHorarioSet[i].Error;
                      }
                    }
                  }
                }
                
                if (errors) {
                  var editedErrors = errors.substring(2);
                  var bCompact = !!me.getView().$().closest(".sapUiSizeCompact").length;
                  MessageBox.warning(editedErrors + ". Solicitar troca de horário ao RH ?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
                    styleClass: bCompact ? "sapUiSizeCompact" : "",
                    onClose: function onClose(sAction) {
                      if (sAction === "YES") {
                        me.callWFMethod(oData);
                      }
                    }
                  });
                } else {
                  for (var i = 0; i < oData.TrocarHorarioSet.length; i++) {
                    if (oData.TrocarHorarioSet[i].Error) {
                      errors = errors + ", " + oData.TrocarHorarioSet[i].NumeroPessoal + " - " + oData.TrocarHorarioSet[i].Nome + ": " + oData.TrocarHorarioSet[
                        i].Error;
                      }
                    }
                    
                    var editedErrors = errors.substring(2);
                    
                    if (editedErrors) {
                      var VBOX = new sap.m.VBox();
                      
                      if (editedErrors.split(", ").length > 0) {
                        for (var i = 0; i < editedErrors.split(", ").length; i++) {
                          VBOX.addItem(new sap.m.Text({
                            text: editedErrors.split(", ")[i]
                          }));
                        }
                      } else {
                        VBOX.addItem(new sap.m.Text({
                          text: editedErrors.split(", ")
                        }));
                      }
                      
                      sap.ui.core.BusyIndicator.hide();
                      var dialog = new sap.m.Dialog({
                        title: 'Erro',
                        type: 'Message',
                        state: 'Error',
                        content: VBOX,
                        beginButton: new sap.m.Button({
                          text: 'OK',
                          press: function press() {
                            dialog.close();
                          }
                        }),
                        afterClose: function afterClose() {
                          dialog.destroy();
                        }
                      });
                      dialog.open();
                    } else {
                      var dialog6 = new sap.m.Dialog({
                        title: 'Successo',
                        type: 'Message',
                        state: 'Success',
                        content: new sap.m.Text({
                          text: 'Troca de horário realizada com sucesso!'
                        }),
                        beginButton: new sap.m.Button({
                          text: 'OK',
                          press: function press() {
                            dialog6.close();
                          }
                        }),
                        afterClose: function afterClose() {
                          dialog6.destroy();
                        }
                      });
                      dialog6.open();
                    }
                    
                    me.reloadAppData(oResponse);
                  }
                }
                
              } else {
                if (oResponse.headers.location.includes("CabecalhoDeepJustPadraoSet") || oResponse.headers.location.includes("JustificarSet") ||
                oResponse.headers.location.includes("CabecalhoDeepFeriadoSet")) {
                  var dialog2 = new sap.m.Dialog({
                    title: 'Successo',
                    type: 'Message',
                    state: 'Success',
                    content: new sap.m.Text({
                      text: 'Ação executada com sucesso!'
                    }),
                    beginButton: new sap.m.Button({
                      text: 'OK',
                      press: function press() {
                        dialog2.close();
                      }
                    }),
                    afterClose: function afterClose() {
                      dialog2.destroy();
                    }
                  });
                  dialog2.open();
                } else {
                  if (oResponse.headers.location.includes("CabecalhoDeepHorarioPadraoSet")) {
                    var dialog3 = new sap.m.Dialog({
                      title: 'Successo',
                      type: 'Message',
                      state: 'Success',
                      content: new sap.m.Text({
                        text: 'Horario padrão executado com sucesso!'
                      }),
                      beginButton: new sap.m.Button({
                        text: 'OK',
                        press: function press() {
                          dialog3.close();
                        }
                      }),
                      afterClose: function afterClose() {
                        dialog3.destroy();
                      }
                    });
                    dialog3.open();
                  }
                }
              }
              
              me.reloadAppData(oResponse);
            }, function (err) {
              me.getView().setBusy(false);
              var oEventBus = sap.ui.getCore().getEventBus();
              oEventBus.publish("TelaEditarMarcacoes", "MarksSaved", true);
              var VBOX = new sap.m.VBox();
              
              if (JSON.parse(err.responseText).error.message.value.split("||||").length > 0) {
                for (var i = 0; i < JSON.parse(err.responseText).error.message.value.split("||||").length; i++) {
                  VBOX.addItem(new sap.m.Text({
                    text: JSON.parse(err.responseText).error.message.value.split("||||")[i]
                  }));
                }
              } else {
                VBOX.addItem(new sap.m.Text({
                  text: JSON.parse(err.responseText).error.message.value
                }));
              }
              
              sap.ui.core.BusyIndicator.hide();
              var dialog = new sap.m.Dialog({
                title: 'Erro',
                type: 'Message',
                state: 'Error',
                content: VBOX,
                beginButton: new sap.m.Button({
                  text: 'OK',
                  press: function press() {
                    dialog.close();
                  }
                }),
                afterClose: function afterClose() {
                  dialog.destroy();
                }
              });
              dialog.open();
            });
          },
          callWFMethod: function callWFMethod(oData) {
            var param = "/CabecalhoTrocarHorarioSet";
            oData.Wf = "X";
            this.sendCreateModel(oData, param);
          },
          changeFooterButtonsState: function changeFooterButtonsState(state) {
            this.byId("justification").setEnabled(state);
            this.byId("editMarks").setEnabled(state);
            this.byId("excluirMarks").setEnabled(state);
            
          },
          changeFooterButtonsVisibility: function changeFooterButtonsVisibility(state) {
            this.byId("justification").setVisible(state);
            this.byId("editMarks").setVisible(state);
            this.byId("excluirMarks").setVisible(state);
          },
          getSelectedPointTreatmentItems: function getSelectedPointTreatmentItems() {
            var aItems = [];
            
            if (this.byId("mainTabBar").getSelectedKey() === "Treatment") {
              var selectedItems = this.table.getSelectedItems();
              
              if (selectedItems.length) {
                for (var i = 0; i < selectedItems.length; i++) {
                  var bindingContext = selectedItems[i].getBindingContext("pointOcurrencyData");
                  var model = bindingContext.getModel().getData();
                  var path = bindingContext.getPath();
                  var index = parseInt(path.substring(path.lastIndexOf("/") + 1, path.length), 10);
                  var item = model[index];
                  aItems.push(item);
                }
              }
              
              for (var i = 0; i < aItems.length; i++) {
                delete aItems[i].DT_DISPLAY;
                delete aItems[i].visible;
                delete aItems[i].__metadata;
                delete aItems[i].TratamentoToEditarNav;
              }
            }
            
            return aItems;
          },
          editPointTreatmentItems: function editPointTreatmentItems(items, actionData) {
            for (var i = 0; i < items.length; i++) {
              items[i].Justificativa = actionData.Justificativa;
              items[i].EditarMarcacaoMotivo = actionData.EditarMarcacaoMotivo;
              items[i].PeriodoInicial = actionData.PeriodoInicial;
              items[i].PeriodoFinal = actionData.PeriodoFinal;
              items[i].NovoHorario = actionData.NovoHorario;
              items[i].TipoDeTroca = actionData.TipoDeTroca;
              items[i].TrocaPermanente = actionData.TrocaPermanente;
              items[i].DataDaTroca = actionData.DataDaTroca;
              items[i].DataDoFeriado = actionData.DataDoFeriado;
            }
            
            return items;
          },
          filterUnidade: function filterUnidade(unidade) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (unidade && this.tableData[i].WERKS_DESC !== unidade) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          filterPersonalNumber: function filterPersonalNumber(numeroPessoal) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (numeroPessoal && this.tableData[i].PERNR !== numeroPessoal) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          filterName: function filterName(nome) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (nome && this.tableData[i].NOME !== nome) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          filterUnidadeOrganizacional: function filterUnidadeOrganizacional(unidadeOrganizacional) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (unidadeOrganizacional && this.tableData[i].ORGEH_DESC !== unidadeOrganizacional) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          filterCentroCusto: function filterCentroCusto(centroCusto) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (centroCusto && this.tableData[i].KOSTL !== centroCusto) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          filterGrupoEmpregados: function filterGrupoEmpregados(GrupoDeEmpregados) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (GrupoDeEmpregados && this.tableData[i].PERSG_DESC !== GrupoDeEmpregados) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          filterTipoDeEquipe: function filterTipoDeEquipe(TipoDeEquipe) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (TipoDeEquipe && this.tableData[i].TIPO_EQUIPE !== TipoDeEquipe) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          //AQUI DiaSemana
          filterDiaSemana: function filterDiaSemana(DiaSemana) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (DiaSemana && this.tableData[i].DT_OCOR !== DiaSemana) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          filterTipoOcorrencia: function filterTipoOcorrencia(TipoOcorrencia) {
            for (var i = 0; i < this.tableData.length; i++) {
              if (TipoOcorrencia && this.tableData[i].DESCR_OCOR !== TipoOcorrencia) {
                this.tableData[i].visible = false;
              }
            }
            
          },
          onSearch: function onSearch(oEvent) {
            for (var i = 0; i < this.tableData.length; i++) {
              this.tableData[i].visible = true;
            }
            
            this.setPointOcurrencyData(this.tableData);
            
            var unidade = this.byId("FilterBar").determineControlByName("G").getValue();
            this.filterUnidade(unidade);
            var numeroPessoal = this.byId("FilterBar").determineControlByName("A").getValue();
            this.filterPersonalNumber(numeroPessoal);
            var nome = this.byId("FilterBar").determineControlByName("B").getValue();
            this.filterName(nome);
            var unidadeOrganizacional = this.byId("FilterBar").determineControlByName("C").getValue();
            this.filterUnidadeOrganizacional(unidadeOrganizacional);
            var centroCusto = this.byId("FilterBar").determineControlByName("D").getValue();
            this.filterCentroCusto(centroCusto);
            var grupoEmpregados = this.byId("FilterBar").determineControlByName("E").getValue();
            this.filterGrupoEmpregados(grupoEmpregados);
            // var TipoDeEquipe = this.byId("FilterBar").determineControlByName("F").getValue();
            // this.filterTipoDeEquipe(TipoDeEquipe); //AQUI DiaSemana
            
            var DiaSemana = this.byId("FilterBar").determineControlByName("H").getValue();
            var dataSAP = DiaSemana.substring(6, 10) + DiaSemana.substring(3, 5) + DiaSemana.substring(0, 2);
            this.filterDiaSemana(dataSAP);
            var TipoOcorrencia = this.byId("FilterBar").determineControlByName("I").getValue();
            this.filterTipoOcorrencia(TipoOcorrencia);
            this.setPointOcurrencyData(this.tableData);
            
            this._onPointTreatmentTableSelectionChange();
          },
          filterUnidadeBH: function filterUnidadeBH(unidade) {
            for (var i = 0; i < this.tableDataBH.length; i++) {
              if (unidade && this.tableDataBH[i].WERKS_DESC !== unidade) {
                this.tableDataBH[i].visible = false;
              }
            }
            
          },
          filterPersonalNumberBH: function filterPersonalNumberBH(numeroPessoal) {
            for (var i = 0; i < this.tableDataBH.length; i++) {
              if (numeroPessoal && this.tableDataBH[i].PERNR !== numeroPessoal) {
                this.tableDataBH[i].visible = false;
              }
            }
            
          },
          filterNameBH: function filterNameBH(nome) {
            for (var i = 0; i < this.tableDataBH.length; i++) {
              if (nome && this.tableDataBH[i].NOME !== nome) {
                this.tableDataBH[i].visible = false;
              }
            }
            
          },
          filterUnidadeOrganizacionalBH: function filterUnidadeOrganizacionalBH(unidadeOrganizacional) {
            for (var i = 0; i < this.tableDataBH.length; i++) {
              if (unidadeOrganizacional && this.tableDataBH[i].ORGEH_DESC !== unidadeOrganizacional) {
                this.tableDataBH[i].visible = false;
              }
            }
            
          },
          filterCentroCustoBH: function filterCentroCustoBH(centroCusto) {
            for (var i = 0; i < this.tableDataBH.length; i++) {
              if (centroCusto && this.tableDataBH[i].KOSTL !== centroCusto) {
                this.tableDataBH[i].visible = false;
              }
            }
            
          },
          filterGrupoEmpregadosBH: function filterGrupoEmpregadosBH(GrupoDeEmpregados) {
            for (var i = 0; i < this.tableDataBH.length; i++) {
              if (GrupoDeEmpregados && this.tableDataBH[i].PERSG_DESC !== GrupoDeEmpregados) {
                this.tableDataBH[i].visible = false;
              }
            }
            
          },
          filterTipoDeEquipeBH: function filterTipoDeEquipeBH(TipoDeEquipe) {
            for (var i = 0; i < this.tableDataBH.length; i++) {
              if (TipoDeEquipe && this.tableDataBH[i].TIPO_EQUIPE !== TipoDeEquipe) {
                this.tableDataBH[i].visible = false;
              }
            }
            
          },
          
          onSearchBH: function onSearchBH(oEvent) {
            for (var i = 0; i < this.tableDataBH.length; i++) {
              this.tableDataBH[i].visible = true;
            }
            
            this.setHourBankData(this.tableDataBH);
            var unidade = this.byId("FilterBarBH").determineControlByName("G").getValue();
            this.filterUnidadeBH(unidade);
            var numeroPessoal = this.byId("FilterBarBH").determineControlByName("A").getValue();
            this.filterPersonalNumberBH(numeroPessoal);
            var nome = this.byId("FilterBarBH").determineControlByName("B").getValue();
            this.filterNameBH(nome);
            var unidadeOrganizacional = this.byId("FilterBarBH").determineControlByName("C").getValue();
            this.filterUnidadeOrganizacionalBH(unidadeOrganizacional);
            var centroCusto = this.byId("FilterBarBH").determineControlByName("D").getValue();
            this.filterCentroCustoBH(centroCusto);
            var grupoEmpregados = this.byId("FilterBarBH").determineControlByName("E").getValue();
            this.filterGrupoEmpregadosBH(grupoEmpregados);
            var TipoDeEquipe = this.byId("FilterBarBH").determineControlByName("F").getValue();
            this.filterTipoDeEquipeBH(TipoDeEquipe);
            
            this.setHourBankData(this.tableDataBH);
          },
          filterUnidadeHR: function filterUnidadeHR(unidade) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              if (unidade && this.tableDataHR[i].WERKS_DESC !== unidade) {
                this.tableDataHR[i].visible = false;
              }
            }
            
          },
          filterPersonalNumberHR: function filterPersonalNumberHR(numeroPessoal) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              if (numeroPessoal && this.tableDataHR[i].PERNR !== numeroPessoal) {
                this.tableDataHR[i].visible = false;
              }
            }
            
          },
          filterNameHR: function filterNameHR(nome) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              if (nome && this.tableDataHR[i].CNAME !== nome) {
                this.tableDataHR[i].visible = false;
              }
            }
            
          },
          filterUnidadeOrganizacionalHR: function filterUnidadeOrganizacionalHR(unidadeOrganizacional) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              if (unidadeOrganizacional && this.tableDataHR[i].ORGEH_DESC !== unidadeOrganizacional) {
                this.tableDataHR[i].visible = false;
              }
            }
            
          },
          filterCentroCustoHR: function filterCentroCustoHR(centroCusto) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              if (centroCusto && this.tableDataHR[i].KOSTL !== centroCusto) {
                this.tableDataHR[i].visible = false;
              }
            }
            
          },
          filterGrupoEmpregadosHR: function filterGrupoEmpregadosHR(GrupoDeEmpregados) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              if (GrupoDeEmpregados && this.tableDataHR[i].PERSG_DESC !== GrupoDeEmpregados) {
                this.tableDataHR[i].visible = false;
              }
            }
            
          },
          filterTipoDeEquipeHR: function filterTipoDeEquipeHR(TipoDeEquipe) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              if (TipoDeEquipe && this.tableDataHR[i].TIPO_EQUIPE !== TipoDeEquipe) {
                this.tableDataHR[i].visible = false;
              }
            }
            
          },
          
          filterTipoOcorrenciaHR: function filterTipoOcorrenciaHR(TipoOcorrencia) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              if (TipoOcorrencia && this.TipoOcorrenciaHR[i].DESCR_OCOR !== TipoOcorrencia) {
                this.tableDataHR[i].visible = false;
              }
            }
            
          },
          onSearchHR: function onSearchHR(oEvent) {
            for (var i = 0; i < this.tableDataHR.length; i++) {
              this.tableDataHR[i].visible = true;
            }
            
            this.setTimesheetData(this.tableDataHR);
            var unidade = this.byId("FilterBarHR").determineControlByName("G").getValue();
            this.filterUnidadeHR(unidade);
            var numeroPessoal = this.byId("FilterBarHR").determineControlByName("A").getValue();
            this.filterPersonalNumberHR(numeroPessoal);
            var nome = this.byId("FilterBarHR").determineControlByName("B").getValue();
            this.filterNameHR(nome);
            var unidadeOrganizacional = this.byId("FilterBarHR").determineControlByName("C").getValue();
            this.filterUnidadeOrganizacionalHR(unidadeOrganizacional);
            var centroCusto = this.byId("FilterBarHR").determineControlByName("D").getValue();
            this.filterCentroCustoHR(centroCusto);
            var grupoEmpregados = this.byId("FilterBarHR").determineControlByName("E").getValue();
            this.filterGrupoEmpregadosHR(grupoEmpregados);
            var TipoDeEquipe = this.byId("FilterBarHR").determineControlByName("F").getValue();
            this.filterTipoDeEquipeHR(TipoDeEquipe);
            
            this.setTimesheetData(this.tableDataHR);
          },
          getPointOcurrencyData: function getPointOcurrencyData() {
            var stringParam = "/TratamentoSet";
            var aFilters = [];
            var me = this;
            this.getView().setBusy(true);
            connections.consumeModel(stringParam, function (oData, oResponse) {
              me.getView().setBusy(false);
              
              for (var i = 0; i < oData.results.length; i++) {
                oData.results[i].visible = true;
                oData.results[i].DT_DISPLAY = oData.results[i].DT_OCOR.substring(6, 8) + "/" + oData.results[i].DT_OCOR.substring(4, 6) + "/" +
                oData.results[i].DT_OCOR.substring(0, 4);
              }
              
              me.setPointOcurrencyData(oData.results);
              me.setFilterData(oData.results);
              me.onSearch();
            }, function (err) {
              me.getView().setBusy(false);
              var dialog = new sap.m.Dialog({
                title: 'Erro',
                type: 'Message',
                state: 'Error',
                content: new sap.m.Text({
                  text: "Não foi possível carregar os dados"
                }),
                beginButton: new sap.m.Button({
                  text: 'OK',
                  press: function press() {
                    dialog.close();
                  }
                }),
                afterClose: function afterClose() {
                  dialog.destroy();
                }
              });
              dialog.open();
            }, "", aFilters);
          },
          setFilterDataBH: function setFilterDataBH(oData) {
            var numeroPessoal = [];
            
            for (var i = 0; i < oData.length; i++) {
              numeroPessoal.push(oData[i].PERNR);
            }
            
            var aux = {};
            numeroPessoal.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              numeroPessoal = Object.keys(aux);
            });
            var json = new sap.ui.model.json.JSONModel();
            json.setData(numeroPessoal);
            this.getView().setModel(json, "numeroPessoalDataBH");
            var nome = [];
            
            for (i = 0; i < oData.length; i++) {
              nome.push(oData[i].NOME);
            }
            
            aux = {};
            nome.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              nome = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(nome);
            this.getView().setModel(json, "nomeDataBH");
            var unidadeOrganizacional = [];
            
            for (i = 0; i < oData.length; i++) {
              unidadeOrganizacional.push(oData[i].ORGEH_DESC);
            }
            
            aux = {};
            unidadeOrganizacional.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              unidadeOrganizacional = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(unidadeOrganizacional);
            this.getView().setModel(json, "unidadeOrganizacionalDataBH");
            var CentroCusto = [];
            
            for (i = 0; i < oData.length; i++) {
              CentroCusto.push(oData[i].KOSTL);
            }
            
            aux = {};
            CentroCusto.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              CentroCusto = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(CentroCusto);
            this.getView().setModel(json, "centroCustoDataBH");
            var GrupoDeEmpregados = [];
            
            for (i = 0; i < oData.length; i++) {
              GrupoDeEmpregados.push(oData[i].PERSG_DESC);
            }
            
            aux = {};
            GrupoDeEmpregados.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              GrupoDeEmpregados = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(GrupoDeEmpregados);
            this.getView().setModel(json, "grupoDeEmpregadosDataBH");
            var TipoDeEquipe = [];
            
            for (i = 0; i < oData.length; i++) {
              TipoDeEquipe.push(oData[i].TIPO_EQUIPE);
            }
            
            aux = {};
            TipoDeEquipe.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              TipoDeEquipe = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(TipoDeEquipe);
            this.getView().setModel(json, "tipoDeEquipeDataBH");
            
            var Unidade = [];
            
            for (i = 0; i < oData.length; i++) {
              Unidade.push(oData[i].WERKS_DESC);
            }
            
            aux = {};
            Unidade.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              Unidade = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(Unidade);
            this.getView().setModel(json, "unidadeDataBH");
          },
          getHourBankData: function getHourBankData() {
            var stringParam = "/BancoDeHorasSet";
            var aFilters = [];
            var me = this;
            connections.consumeModel(stringParam, function (oData, oResponse) {
              for (var i = 0; i < oData.results.length; i++) {
                oData.results[i].DT_DISPLAY = oData.results[i].DT_OCOR.substring(4, 6) + "/" + oData.results[i].DT_OCOR.substring(0, 4);
                oData.results[i].visible = true;
              }
              
              me.setHourBankData(oData.results);
              me.setFilterDataBH(oData.results);
            }, function (err) {
              var dialog = new sap.m.Dialog({
                title: 'Erro',
                type: 'Message',
                state: 'Error',
                content: new sap.m.Text({
                  text: "Não foi possível carregar os dados"
                }),
                beginButton: new sap.m.Button({
                  text: 'OK',
                  press: function press() {
                    dialog.close();
                  }
                }),
                afterClose: function afterClose() {
                  dialog.destroy();
                }
              });
              dialog.open();
            }, "", aFilters);
          },
          getTimesheetData: function getTimesheetData() {
            var stringParam = "/PlanoHorarioSet";
            var aFilters = [];
            var me = this;
            connections.consumeModel(stringParam, function (oData, oResponse) {
              for (var i = 0; i < oData.results.length; i++) {
                oData.results[i].visible = true;
              }
              
              me.setTimesheetData(oData.results);
              me.setFilterDataHR(oData.results);
            }, function (err) {}, "", aFilters);
          },
          setFilterDataHR: function setFilterDataHR(oData) {
            var numeroPessoal = [];
            
            for (var i = 0; i < oData.length; i++) {
              numeroPessoal.push(oData[i].PERNR);
            }
            
            var aux = {};
            numeroPessoal.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              numeroPessoal = Object.keys(aux);
            });
            var json = new sap.ui.model.json.JSONModel();
            json.setData(numeroPessoal);
            this.getView().setModel(json, "numeroPessoalDataHR");
            var nome = [];
            
            for (i = 0; i < oData.length; i++) {
              nome.push(oData[i].CNAME);
            }
            
            aux = {};
            nome.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              nome = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(nome);
            this.getView().setModel(json, "nomeDataHR");
            var unidadeOrganizacional = [];
            
            for (i = 0; i < oData.length; i++) {
              unidadeOrganizacional.push(oData[i].ORGEH_DESC);
            }
            
            aux = {};
            unidadeOrganizacional.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              unidadeOrganizacional = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(unidadeOrganizacional);
            this.getView().setModel(json, "unidadeOrganizacionalDataHR");
            var CentroCusto = [];
            
            for (i = 0; i < oData.length; i++) {
              CentroCusto.push(oData[i].KOSTL);
            }
            
            aux = {};
            CentroCusto.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              CentroCusto = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(CentroCusto);
            this.getView().setModel(json, "centroCustoDataHR");
            var GrupoDeEmpregados = [];
            
            for (i = 0; i < oData.length; i++) {
              GrupoDeEmpregados.push(oData[i].PERSG_DESC);
            }
            
            aux = {};
            GrupoDeEmpregados.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              GrupoDeEmpregados = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(GrupoDeEmpregados);
            this.getView().setModel(json, "grupoDeEmpregadosDataHR");
            var TipoDeEquipe = [];
            
            for (i = 0; i < oData.length; i++) {
              TipoDeEquipe.push(oData[i].TIPO_EQUIPE);
            }
            
            aux = {};
            TipoDeEquipe.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              TipoDeEquipe = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(TipoDeEquipe);
            this.getView().setModel(json, "tipoDeEquipeDataHR");
            
            var Unidade = [];
            
            for (i = 0; i < oData.length; i++) {
              Unidade.push(oData[i].WERKS_DESC);
            }
            
            aux = {};
            Unidade.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              Unidade = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(Unidade);
            this.getView().setModel(json, "unidadeDataHR");
          },
          setFilterData: function setFilterData(oData) {
            var numeroPessoal = [];
            
            for (var i = 0; i < oData.length; i++) {
              numeroPessoal.push(oData[i].PERNR);
            }
            
            var aux = {};
            numeroPessoal.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              numeroPessoal = Object.keys(aux);
            });
            var json = new sap.ui.model.json.JSONModel();
            json.setData(numeroPessoal);
            this.getView().setModel(json, "numeroPessoalData");
            var nome = [];
            
            for (i = 0; i < oData.length; i++) {
              nome.push(oData[i].NOME);
            }
            
            aux = {};
            nome.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              nome = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(nome);
            this.getView().setModel(json, "nomeData");
            var unidadeOrganizacional = [];
            
            for (i = 0; i < oData.length; i++) {
              unidadeOrganizacional.push(oData[i].ORGEH_DESC);
            }
            
            aux = {};
            unidadeOrganizacional.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              unidadeOrganizacional = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(unidadeOrganizacional);
            this.getView().setModel(json, "unidadeOrganizacionalData");
            var CentroCusto = [];
            
            for (i = 0; i < oData.length; i++) {
              CentroCusto.push(oData[i].KOSTL);
            }
            
            aux = {};
            CentroCusto.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              CentroCusto = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(CentroCusto);
            this.getView().setModel(json, "centroCustoData");
            var GrupoDeEmpregados = [];
            
            for (i = 0; i < oData.length; i++) {
              GrupoDeEmpregados.push(oData[i].PERSG_DESC);
            }
            
            aux = {};
            GrupoDeEmpregados.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              GrupoDeEmpregados = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(GrupoDeEmpregados);
            this.getView().setModel(json, "grupoDeEmpregadosData");
            var TipoDeEquipe = [];
            
            for (i = 0; i < oData.length; i++) {
              TipoDeEquipe.push(oData[i].TIPO_EQUIPE);
            }
            
            aux = {};
            TipoDeEquipe.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              TipoDeEquipe = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(TipoDeEquipe);
            this.getView().setModel(json, "tipoDeEquipeData"); //AQUI DiaSemana
            
            var DiaSemana = [];
            
            for (i = 0; i < oData.length; i++) {
              DiaSemana.push(oData[i].DT_OCOR);
            }
            
            aux = {};
            DiaSemana.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              DiaSemana = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(DiaSemana);
            this.getView().setModel(json, "DiaSemana");
            var TipoOcorrencia = [];
            
            for (i = 0; i < oData.length; i++) {
              TipoOcorrencia.push(oData[i].DESCR_OCOR);
            }
            
            aux = {};
            TipoOcorrencia.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              TipoOcorrencia = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(TipoOcorrencia);
            this.getView().setModel(json, "TipoOcorrencia");
            var Unidade = [];
            
            for (i = 0; i < oData.length; i++) {
              Unidade.push(oData[i].WERKS_DESC);
            }
            
            aux = {};
            Unidade.forEach(function (i) {
              if (!aux[i]) {
                aux[i] = true;
              }
              
              Unidade = Object.keys(aux);
            });
            json = new sap.ui.model.json.JSONModel();
            json.setData(Unidade);
            this.getView().setModel(json, "unidadeData");
          },
          setPointOcurrencyData: function setPointOcurrencyData(oData) {
            var json = new sap.ui.model.json.JSONModel();
            var displayData = this.organizeDisplayData(oData);
            this.tableData = oData;
            json.setSizeLimit(999999);
            json.setData(displayData);
            this.getView().setModel(json, "pointOcurrencyData");
            
            const table = this.getView().byId('PointTreatmentTable');
            const items = table.getItems();
            for(let i=0; i < displayData.length; i++){
              const cells = items[i].getCells();
              for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                if(cell.getId().search('boxMarcacoes') !== -1){
                  cell.destroyItems();
                  if(displayData[i].objetosMarcacoes && displayData[i].objetosMarcacoes.length){
                    for (let k = 0; k < displayData[i].objetosMarcacoes.length; k++) {
                      const objetosMarcacao = displayData[i].objetosMarcacoes[k];
                      cell.addItem(objetosMarcacao);
                    }
                  }
                  break;//sai do for
                }
              }
            }
            this._onPointTreatmentTableSelectionChange();
          },
          //aqui
          organizeDisplayData: function organizeDisplayData(oData) {
            var displayData = [];
            for (let i = 0; i < oData.length; i++) {
              if(oData[i].MARCACOES){
                //metade do array de marcações são marcações,
                // o restante são as classificações de cada marcação
                let marcacoes = oData[i].MARCACOES.split("-");
                //let marcacoes = ["00:00","15:32","17:00","M","R","M"];
                let tam = marcacoes.length/2;
                //criar array de components ObjectStatus e anexar ao model
                oData[i].objetosMarcacoes = new Array;
                //adiciona o conteudo do componente aqui dentro seguindo a logica  R = vermelho e M = verde
                for(let j = 0; j < tam; j++){
                  const separator = new Text();
                  separator.setText("-");
                  const myObjectStatus = new ObjectStatus();
                  myObjectStatus.setText(marcacoes[j]);
                  if(marcacoes[tam+j] == 'M'){
                    myObjectStatus.setState(sap.ui.core.ValueState.Success);
                  }else{
                    myObjectStatus.setState(sap.ui.core.ValueState.Error);
                  }
                  if(oData[i].objetosMarcacoes.length) oData[i].objetosMarcacoes.push(separator);
                  oData[i].objetosMarcacoes.push(myObjectStatus);
                }
              }
              //seta todas modificacoes no display 
              if (oData[i].visible) {
                displayData.push(oData[i]);
              }
            }
            
            return displayData;
          },
          setHourBankData: function setHourBankData(oData) {
            var json = new sap.ui.model.json.JSONModel();
            var displayData = this.organizeDisplayDataBH(oData);
            this.tableDataBH = oData;
            json.setData(displayData);
            this.getView().setModel(json, "hourBankData");
          },
          organizeDisplayDataBH: function organizeDisplayDataBH(oData) {
            var displayData = [];
            
            for (var i = 0; i < oData.length; i++) {
              if (oData[i].visible) {
                displayData.push(oData[i]);
              }
            }
            
            return displayData;
          },
          setTimesheetData: function setTimesheetData(oData) {
            var json = new sap.ui.model.json.JSONModel();
            var displayData = this.organizeDisplayDataHR(oData);
            this.tableDataHR = oData;
            json.setData(displayData);
            this.getView().setModel(json, "timesheetData");
          },
          organizeDisplayDataHR: function organizeDisplayDataHR(oData) {
            var displayData = [];
            
            for (var i = 0; i < oData.length; i++) {
              if (oData[i].visible) {
                displayData.push(oData[i]);
              }
            }
            
            return displayData;
          },
          JustificationSelected: function JustificationSelected(sEvent, sChanel, oData) {
            var pointTreatmentItems = this.getSelectedPointTreatmentItems();
            var obj = {
              NumeroPessoal: "",
              AWART: oData.selectedJustification,
              ATEXT: oData.selectedJustificationTxt,
              BEGDA: oData.dataInicio,
              ENDDA: oData.dataFim,
              BEGHOUR: oData.horaInicio,
              ENDHOUR: oData.horaFim,
              HORAS: oData.horas,
              TratamentoSet: pointTreatmentItems
            };
            var param = "/JustificarSet";
            sap.ui.core.BusyIndicator.show();
            this.sendCreateModel(obj, param);
          },
          SobreAvisoSelected: function SobreAvisoSelected(sEvent, sChanel, oData) {
            var pointTreatmentItems = this.getSelectedPointTreatmentItems();
            var obj = {
              PERNR: oData.pernr,
              BEGDA: oData.begda,
              ENDDA: oData.endda,
              PLANTAO: oData.plantao,
              HRA_INI: oData.hra_ini,
              HRA_FIM: oData.hra_fim
            };
            var param = "/SobreavisoSet";
            sap.ui.core.BusyIndicator.show();
            this.sendCreateModel(obj, param);
          },
          
          SubsEscalaSelected: function SubsEscalaSelected(sEvent, sChanel, oData) {
            var pointTreatmentItems = this.getSelectedPointTreatmentItems();
            var obj = {
              PERNR: oData.PERNR,
              BEGDA: oData.BEGDA,
              ENDDA: oData.ENDDA,
              ESCALA: oData.ESCALA
            };
            var param = "/SubstituicaoSet";
            sap.ui.core.BusyIndicator.show();
            this.sendCreateModel(obj, param);
          },
          
          BancoHoras: function BancoHoras(sChanel, sEvent, oData) {
            var obj = {
              Pernr: oData.pernr,
              Data: oData.data,
              TpTempo: oData.tpTempo,
              QtHoras: oData.qtHoras
            };
            var param = "/BancoHorasSet";
            sap.ui.core.BusyIndicator.show();
            this.sendCreateModel(obj, param);
            
          },
          
          HorasExtras: function HorasExtras(sChanel, sEvent, oData) {
            //var oHeader = this.getView().getModel("headerData").getData();
            var obj = {
              PERNR: oData.Pernr,
              DATA: oData.Data,
              VTKEN_FROM: oData.Vtken_From,
              VTKEN_TO: oData.Vtken_To,
              DIA_ANT: oData.Dia_ant,
              TP_REMUR: oData.tpRemur,
              TP_PRESENCA: oData.Tp_Presenca
            };
            
            var param = "/HorasExtrasSet";
            sap.ui.core.BusyIndicator.show();
            this.sendCreateModel(obj, param);
            
          },
          
          StandardTimeReasonSelected: function StandardTimeReasonSelected(sEvent, sChanel, oData) {
            var pointTreatmentItems = this.getSelectedPointTreatmentItems();
            var obj = {
              NumeroPessoal: "",
              ABWGR: oData.selectedReason,
              GTEXT: oData.selectedReasonText,
              CabecalhoHorarioPadraoToTrat: pointTreatmentItems
            };
            var param = "/CabecalhoDeepHorarioPadraoSet";
            sap.ui.core.BusyIndicator.show();
            this.sendCreateModel(obj, param);
          },
          ShiftChangeSelected: function ShiftChangeSelected(sEvent, sChanel, oData) {
            if (oData.changeType === "Troca Permanente") {
              oData.TrocaPermanente = "X";
              oData.TrocaProvisoria = "";
            } else if (oData.changeType === "Troca Provisória") {
              oData.TrocaProvisoria = "X";
              oData.TrocaPermanente = "";
            }
            
            var pointTreatmentItems = this.getSelectedPointTreatmentItems();
            pointTreatmentItems = this.editForHourItems(pointTreatmentItems);
            var obj = {
              NumeroPessoal: oData.NumeroPessoal,
              PeriodoInicial: oData.initialValue,
              PeriodoFinal: oData.finalValue,
              NovoHorario: oData.NovoHorario,
              TrocaPermanente: oData.TrocaPermanente,
              TrocaProvisoria: oData.TrocaProvisoria,
              Wf: "",
              TrocarHorarioSet: pointTreatmentItems
            };
            var param = "/CabecalhoTrocarHorarioSet";
            sap.ui.core.BusyIndicator.show();
            this.sendCreateModel(obj, param);
          },
          editForHourItems: function editForHourItems(items) {
            var customItems = [];
            
            for (var i = 0; i < items.length; i++) {
              var customItem = {
                NumeroPessoal: items[i].PERNR,
                Nome: items[i].NOME,
                HoraContratual: items[i].HR_TEOR,
                Werks: items[i].WERKS,
                WerksDesc: items[i].WERKS_DESC,
                Orgeh: items[i].ORGEH,
                OrgehDesc: items[i].ORGEH_DESC,
                Kostl: items[i].KOSTL,
                KostlDesc: items[i].KOSTL_DESC,
                Persg: items[i].PERSG,
                PersgDesc: items[i].PERSG_DESC,
                Schkz: "",
                TipoDeEquipe: items[i].TIPO_EQUIPE,
                Schkz_Desc: "",
                Btrtl: "",
                Btrtl_Desc: "",
                Email: "",
                Error: "",
                CallWF: "",
                TP_ERRO: "",
                TP_TROCA: "",
                hr_novo: "",
                hr_atual: ""
              };
              customItems.push(customItem);
            }
            
            return customItems;
          },
          HolidayChangeSelected: function HolidayChangeSelected(sEvent, sChanel, oData) {
            var pointTreatmentItems = this.getSelectedPointTreatmentItems();
            pointTreatmentItems = this.editPointTreatmentItemsHoliday(pointTreatmentItems);
            var obj = {
              NumeroPessoal: "",
              DataDaTroca: oData.initialValue,
              DataDoFeriado: oData.finalValue,
              CabecalhotoFeriadoNav: pointTreatmentItems
            };
            var param = "/CabecalhoDeepFeriadoSet";
            sap.ui.core.BusyIndicator.show();
            
            if (obj.DataDaTroca) {
              this.sendCreateModel(obj, param);
            }
          },
          editPointTreatmentItemsHoliday: function editPointTreatmentItemsHoliday(items) {
            var holidayItems = [];
            
            for (var i = 0; i < items.length; i++) {
              var holidayItem = [];
              holidayItems.push({
                NumeroPessoal: items[i].PERNR,
                Nome: items[i].NOME,
                Werks: items[i].WERKS,
                Werks_Desc: items[i].WERKS_DESC,
                Orgeh: items[i].ORGEH,
                Orgeh_Desc: items[i].ORGEH_DESC,
                Kostl: items[i].KOSTL,
                Kostl_Desc: items[i].KOSTL_DESC,
                Persg: items[i].PERSG,
                Persg_Desc: items[i].PERSG_DESC,
                Tipo_Desc: "",
                Schkz: "",
                Schkz_Desc: ""
              });
            }
            
            return holidayItems;
          },
          MarksEdited: function MarksEdited(sEvent, sChanel, oData) {
            var pointTreatmentItem = this.getSelectedPointTreatmentItems()[0];
            var obj = {
              PERNR: pointTreatmentItem.PERNR,
              NOME: pointTreatmentItem.NOME,
              DT_OCOR: pointTreatmentItem.DT_OCOR,
              DIA_SEM: pointTreatmentItem.DIA_SEM,
              HR_TEOR: pointTreatmentItem.HR_TEOR,
              DIA_SEGUINTE: pointTreatmentItem.DIA_SEGUINTE,
              MARCACOES: pointTreatmentItem.MARCACOES,
              OCORRENCIA: pointTreatmentItem.OCORRENCIA,
              APUR: pointTreatmentItem.APUR,
              DESCR_OCOR: pointTreatmentItem.DESCR_OCOR,
              SHOW_2011: pointTreatmentItem.SHOW_2011,
              EDIT_2011: pointTreatmentItem.EDIT_2011,
              TP_AUS: pointTreatmentItem.TP_AUS,
              TXT_AUS: pointTreatmentItem.TXT_AUS,
              ZTART: pointTreatmentItem.ZTART,
              APUR_CENT: pointTreatmentItem.APUR_CENT,
              INI_OCOR_CENT: pointTreatmentItem.INI_OCOR_CENT,
              FIM_OCOR_CENT: pointTreatmentItem.FIM_OCOR_CENT,
              WERKS: pointTreatmentItem.WERKS,
              WERKS_DESC: pointTreatmentItem.WERKS_DESC,
              ORGEH: pointTreatmentItem.ORGEH,
              ORGEH_DESC: pointTreatmentItem.ORGEH_DESC,
              KOSTL: pointTreatmentItem.KOSTL,
              KOSTL_DESC: pointTreatmentItem.KOSTL_DESC,
              PERSG: pointTreatmentItem.PERSG,
              PERSG_DESC: pointTreatmentItem.PERSG_DESC,
              TIPO_EQUIPE: pointTreatmentItem.TIPO_EQUIPE,
              PERNRERROR: pointTreatmentItem.PERNRERROR,
              NOMEERROR: pointTreatmentItem.NOMEERROR,
              DATAERROR: pointTreatmentItem.DATAERROR,
              MESSAGEERROR: pointTreatmentItem.MESSAGEERROR,
              TratamentoToEditarNav: oData
            };
            var param = "/TratamentoSet";
            this.sendCreateModel(obj, param);
          },
          
          MarksExcluir: function MarksExcluir(sEvent, sChanel, oData) {
            var pointTreatmentItem = this.getSelectedPointTreatmentItems()[0];
            var obj = {
              PERNR: pointTreatmentItem.PERNR,
              NOME: pointTreatmentItem.NOME,
              DT_OCOR: pointTreatmentItem.DT_OCOR,
              DIA_SEM: pointTreatmentItem.DIA_SEM,
              HR_TEOR: pointTreatmentItem.HR_TEOR,
              DIA_SEGUINTE: pointTreatmentItem.DIA_SEGUINTE,
              MARCACOES: pointTreatmentItem.MARCACOES,
              OCORRENCIA: pointTreatmentItem.OCORRENCIA,
              APUR: pointTreatmentItem.APUR,
              DESCR_OCOR: pointTreatmentItem.DESCR_OCOR,
              SHOW_2011: pointTreatmentItem.SHOW_2011,
              EDIT_2011: pointTreatmentItem.EDIT_2011,
              TP_AUS: pointTreatmentItem.TP_AUS,
              TXT_AUS: pointTreatmentItem.TXT_AUS,
              ZTART: pointTreatmentItem.ZTART,
              APUR_CENT: pointTreatmentItem.APUR_CENT,
              INI_OCOR_CENT: pointTreatmentItem.INI_OCOR_CENT,
              FIM_OCOR_CENT: pointTreatmentItem.FIM_OCOR_CENT,
              WERKS: pointTreatmentItem.WERKS,
              WERKS_DESC: pointTreatmentItem.WERKS_DESC,
              ORGEH: pointTreatmentItem.ORGEH,
              ORGEH_DESC: pointTreatmentItem.ORGEH_DESC,
              KOSTL: pointTreatmentItem.KOSTL,
              KOSTL_DESC: pointTreatmentItem.KOSTL_DESC,
              PERSG: pointTreatmentItem.PERSG,
              PERSG_DESC: pointTreatmentItem.PERSG_DESC,
              TIPO_EQUIPE: pointTreatmentItem.TIPO_EQUIPE,
              PERNRERROR: pointTreatmentItem.PERNRERROR,
              NOMEERROR: pointTreatmentItem.NOMEERROR,
              DATAERROR: pointTreatmentItem.DATAERROR,
              MESSAGEERROR: pointTreatmentItem.MESSAGEERROR,
              
              TratamentoToExcluirNav: oData
            };
            var param = "/TratamentoSet";
            this.sendCreateModel(obj, param);
          },
          
          _onPageNavButtonPress: function _onPageNavButtonPress(oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            return new Promise(function (fnResolve) {
              this.doNavigate("TratamentoDoPonto", oBindingContext, fnResolve, "");
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
              sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
                sRouteName);
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
            getSelectedInfo: function getSelectedInfo(oEvent) {
              var model = oEvent.getSource().getParent().getBindingContext("hourBankData").getModel().getData();
              var path = oEvent.getSource().getParent().getBindingContext("hourBankData").getPath();
              var index = parseInt(path.substring(path.lastIndexOf("/") + 1, path.length), 10);
              return model[index];
            },
            _onBHLinkPress: function _onBHLinkPress(oEvent) {
              this.BHItem = this.getSelectedInfo(oEvent);
              var sPopoverName = "BHPopover";
              this.mPopovers = this.mPopovers || {};
              var oPopover = this.mPopovers[sPopoverName];
              
              if (!oPopover) {
                oPopover = new Popover2(this.getView());
                this.mPopovers[sPopoverName] = oPopover;
                oPopover.getControl().setPlacement("Auto"); // For navigation.
                
                oPopover.setRouter(this.oRouter);
              }
              
              var oSource = oEvent.getSource();
              oPopover.open(oSource);
            },
            
            _onPointTreatmentTableSelectionChange: function _onPointTreatmentTableSelectionChange(oEvent) {
              if (!this.table) {
                this.table = this.byId("PointTreatmentTable");
              }
              
              if (this.table.getSelectedItems().length) {
                this.changeFooterButtonsState(true);
                
                if (this.table.getSelectedItems().length > 1) {
                  this.byId("editMarks").setEnabled(false);
                  this.byId("excluirMarks").setEnabled(false);
                  this.byId("justification").setEnabled(false);
                }
              } else {
                this.changeFooterButtonsState(false);
              }
              
              var oldLine = "";
              
              for (var i = 0; i < this.getSelectedPointTreatmentItems().length; i++) {
                var curLine = this.getSelectedPointTreatmentItems()[i].TP_ZTART;
                
                if (oldLine !== "") {
                  if (curLine !== oldLine) {
                    this.byId("justification").setEnabled(false);
                  } else {
                    this.byId("justification").setEnabled(true);
                  }
                } else {
                  oldLine = curLine;
                  curLine = "";
                }
              }
            },
            _onTabBarFilterSelect: function _onTabBarFilterSelect() {
              if (this.byId("mainTabBar").getSelectedKey() === "Treatment") {
                this.changeFooterButtonsVisibility(true);
                
                this._onPointTreatmentTableSelectionChange();
              } else {
                this.changeFooterButtonsVisibility(false);
                this.changeFooterButtonsState(false);
              }
            },
            _onTimesheetRowPress: function _onTimesheetRowPress(oEvent) {
              var oBindingContext = oEvent.getSource().getBindingContext("timesheetData").getModel().getData();
              var path = oEvent.getSource().getBindingContext("timesheetData").getPath();
              var index = parseInt(path.substring(path.lastIndexOf("/") + 1, path.length), 10);
              var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
              oRouter.navTo("PlanoHorario", {
                contextpath: oBindingContext[index].PERNR + "," + oBindingContext[index].WERKS + "," + oBindingContext[index].MOFID
              });
            },
            
            _onStandardJustificationButtonPress: function _onStandardJustificationButtonPress() {
              var pointTreatmentItems = this.getSelectedPointTreatmentItems();
              var obj = {
                NumeroPessoal: "",
                JustPadraoToTratamentoNav: pointTreatmentItems
              };
              var param = "/CabecalhoDeepJustPadraoSet";
              sap.ui.core.BusyIndicator.show();
              this.sendCreateModel(obj, param);
            },
            
            _onJustificationButtonPress: function _onJustificationButtonPress() {
              var sDialogName = "JustificationDialog";
              this.mDialogs = this.mDialogs || {};
              var oDialog = this.mDialogs[sDialogName];
              
              if (!oDialog) {
                oDialog = new JustificationDialog(this.getView());
                this.mDialogs[sDialogName] = oDialog; // For navigation.
                
                oDialog.setRouter(this.oRouter);
              }
              
              oDialog.open();
            },
            
            _onOverTimeButtonPress: function _onOverTimeButtonPress() {
              var sDialogName = "Dialog4";
              this.mDialogs = this.mDialogs || {};
              var oDialog = this.mDialogs[sDialogName];
              
              if (!oDialog) {
                oDialog = new Dialog4(this.getView());
                this.mDialogs[sDialogName] = oDialog; // For navigation.
                
                oDialog.setRouter(this.oRouter);
              }
              
              oDialog.open();
            },
            
            _onBankHourButtonPress: function _onBankHourButtonPress() {
              var sDialogName = "Dialog5";
              this.mDialogs = this.mDialogs || {};
              var oDialog = this.mDialogs[sDialogName];
              
              if (!oDialog) {
                oDialog = new Dialog5(this.getView());
                this.mDialogs[sDialogName] = oDialog; // For navigation.
                
                oDialog.setRouter(this.oRouter);
              }
              
              oDialog.open();
            },
            
            _onSobreAvisoButtonPress: function _onSobreAvisoButtonPress() {
              var sDialogName = "SobreAviso";
              this.mDialogs = this.mDialogs || {};
              var oDialog = this.mDialogs[sDialogName];
              
              if (!oDialog) {
                oDialog = new SobreAviso(this.getView());
                this.mDialogs[sDialogName] = oDialog; // For navigation.
                
                oDialog.setRouter(this.oRouter);
              }
              
              oDialog.open();
            },
            
            _onSubsEscalaButtonPress: function _onSubsEscalaButtonPress() {
              var sDialogName = "SubsEscala";
              this.mDialogs = this.mDialogs || {};
              var oDialog = this.mDialogs[sDialogName];
              
              if (!oDialog) {
                oDialog = new SubsEscala(this.getView());
                this.mDialogs[sDialogName] = oDialog; // For navigation.
                
                oDialog.setRouter(this.oRouter);
              }
              
              oDialog.open();
            },
            
            _onEditMarksButtonPress: function _onEditMarksButtonPress(oEvent) {
              var pointTreatmentItems = this.getSelectedPointTreatmentItems();
              this.editMarksObj = {
                Acao: "EditMarks",
                Items: pointTreatmentItems
              };
              var sPopoverName = "TelaEditarMarcacoes";
              this.mPopovers = this.mPopovers || {};
              var oPopover = this.mPopovers[sPopoverName];
              
              if (!oPopover) {
                oPopover = new TelaEditarMarcacoes(this.getView());
                this.mPopovers[sPopoverName] = oPopover;
                oPopover.getControl().setPlacement("Auto"); // For navigation.
                
                oPopover.setRouter(this.oRouter);
              }
              
              var oSource = oEvent.getSource();
              oPopover.open(oSource);
            },
            
            
            /*		_onEditMarksButtonPress: function _onEditMarksButtonPress() {
              var sDialogName = "TelaEditarMarcacoes";
              this.mDialogs = this.mDialogs || {};
              var oDialog = this.mDialogs[sDialogName];
              
              if (!oDialog) {
                oDialog = new TelaEditarMarcacoes(this.getView());
                this.mDialogs[sDialogName] = oDialog; // For navigation.
                
                oDialog.setRouter(this.oRouter);
              }
              
              oDialog.open();
            },*/
            
            _onExcluirMarksButtonPress: function _onExcluirMarksButtonPress(oEvent) {
              var pointTreatmentItems = this.getSelectedPointTreatmentItems();
              this.editMarksObj = {
                Acao: "ExcluirMarks",
                Items: pointTreatmentItems
              };
              var sPopoverName = "ExcluirMarcacoes";
              this.mPopovers = this.mPopovers || {};
              var oPopover = this.mPopovers[sPopoverName];
              
              if (!oPopover) {
                oPopover = new ExcluirMarcacoes(this.getView());
                this.mPopovers[sPopoverName] = oPopover;
                oPopover.getControl().setPlacement("Auto"); // For navigation.
                
                oPopover.setRouter(this.oRouter);
              }
              
              var oSource = oEvent.getSource();
              oPopover.open(oSource);
            },
            
            _onStandardTimeButtonPress: function _onStandardTimeButtonPress() {
              var sDialogName = "StandardTimeDialog";
              this.mDialogs = this.mDialogs || {};
              var oDialog = this.mDialogs[sDialogName];
              
              if (!oDialog) {
                oDialog = new Dialog7(this.getView());
                this.mDialogs[sDialogName] = oDialog; // For navigation.
                
                oDialog.setRouter(this.oRouter);
              }
              
              oDialog.open();
            },
            _onShiftChangeButtonPress: function _onShiftChangeButtonPress() {
              var sDialogName = "ShiftChangeDialog";
              this.mDialogs = this.mDialogs || {};
              var oDialog = this.mDialogs[sDialogName];
              
              if (!oDialog) {
                oDialog = new Dialog3(this.getView());
                this.mDialogs[sDialogName] = oDialog; // For navigation.
                
                oDialog.setRouter(this.oRouter);
              }
              
              oDialog.open();
            },
            
            
            initModels: function initModels() {
              this.getPointOcurrencyData();
              this.getHourBankData();
              this.getTimesheetData();
            },
            
            onDateChange: function (oEvent) {
              
              var fieldname = oEvent.getParameter("id");
              
              if (oEvent.getParameter("valid") === true) {
                this.fMessage("None", null, fieldname);
              } else {
                this.fMessage("Error", "entrada_invalida", fieldname);
                var msgErr = "Favor inserir data corretamente, Ex: mm.aaaa/mmaaaa";
                MessageToast.show(msgErr);
              }
              
            },
            
            fMessage: function (type, msg, field) {
              // var oBundle;
              
              //Get message text from i18n
              // oBundle = this.getView().getModel("i18n").getResourceBundle();
              
              // var message = oBundle.getText(msg);
              
              //Message text
              // this.getView().byId(field).setValueStateText(message);
              
              //Set message in the field with the type and text
              this.getView().byId(field).setValueState(sap.ui.core.ValueState[type]);
            },
            
            onFiltrar: function () {
              
              if (this.getView().byId("dtFiltro").getValue() !== "") {
                
                var dtEscolhida = this.getView().byId("dtFiltro").getValue();
                var mes = dtEscolhida.substring(0, 2);
                var ano = dtEscolhida.substring(3, 7);
                
                var stringParam = "/TratamentoSet";
                var aFilters = [];
                
                var oFilter = new sap.ui.model.Filter({
                  path: "MES",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: mes
                });
                aFilters.push(oFilter);
                
                var oFilterAno = new sap.ui.model.Filter({
                  path: "ANO",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: ano
                });
                aFilters.push(oFilterAno);
                
                var me = this;
                this.getView().setBusy(true);
                connections.consumeModel(stringParam, function (oData, oResponse) {
                  me.getView().setBusy(false);
                  
                  for (var i = 0; i < oData.results.length; i++) {
                    oData.results[i].visible = true;
                    oData.results[i].DT_DISPLAY = oData.results[i].DT_OCOR.substring(6, 8) + "/" + oData.results[i].DT_OCOR.substring(4, 6) + "/" +
                    oData.results[i].DT_OCOR.substring(0, 4);
                  }
                  
                  me.setPointOcurrencyData(oData.results);
                  me.setFilterData(oData.results);
                  me.onSearch();
                  
                  var txtPeriodo = oData.results[0].DESC_PERIODO;
                  me.getView().byId("txtPeriodo").setText(txtPeriodo);
                  
                }, function (err) {
                  me.getView().setBusy(false);
                  var dialog = new sap.m.Dialog({
                    title: 'Erro',
                    type: 'Message',
                    state: 'Error',
                    content: new sap.m.Text({
                      text: "Não foi possível carregar os dados"
                    }),
                    beginButton: new sap.m.Button({
                      text: 'OK',
                      press: function press() {
                        dialog.close();
                      }
                    }),
                    afterClose: function afterClose() {
                      dialog.destroy();
                    }
                  });
                  dialog.open();
                }, "", aFilters);
                
              } else {
                var msg = 'Necessário informar o periodo da busca!';
                MessageToast.show(msg);
              }
            },
            
            onChangeFilterButton: function () {
              var oFilter = this.getView().byId("FilterBar"),
              that = this;
              
              oFilter.addEventDelegate({
                "onAfterRendering": function (oEvent) {
                  // var oResourceBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();
                  
                  var oButton = oEvent.srcControl._oSearchButton;
                  oButton.setText("Filtrar");
                  var oButtonHide = oEvent.srcControl._oHideShowButton;
                  oButtonHide.setText("Ocultar barra de filtros");
                  var oButtonClear = oEvent.srcControl._oClearButtonOnFB;
                  oButtonClear.setText("Limpar filtros");
                }
              });
            },
            
            onChangeFilterButtonBH: function () {
              var oFilter = this.getView().byId("FilterBarBH"),
              that = this;
              
              oFilter.addEventDelegate({
                "onAfterRendering": function (oEvent) {
                  // var oResourceBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();
                  
                  var oButton = oEvent.srcControl._oSearchButton;
                  oButton.setText("Filtrar");
                  var oButtonHide = oEvent.srcControl._oHideShowButton;
                  oButtonHide.setText("Ocultar barra de filtros");
                  var oButtonClear = oEvent.srcControl._oClearButtonOnFB;
                  oButtonClear.setText("Limpar filtros");
                }
              });
            },
            
            onChangeFilterButtonHR: function () {
              var oFilter = this.getView().byId("FilterBarHR"),
              that = this;
              
              oFilter.addEventDelegate({
                "onAfterRendering": function (oEvent) {
                  // var oResourceBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();
                  
                  var oButton = oEvent.srcControl._oSearchButton;
                  oButton.setText("Filtrar");
                  var oButtonHide = oEvent.srcControl._oHideShowButton;
                  oButtonHide.setText("Ocultar barra de filtros");
                  var oButtonClear = oEvent.srcControl._oClearButtonOnFB;
                  oButtonClear.setText("Limpar filtros");
                }
              });
            },
            
            onInit: function onInit() {
              this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
              sap.ui.getCore().getConfiguration().setLanguage("pt-BR");
              //registering warning of landscape mode
              sap.ui.Device.orientation.attachHandler(function (oEvt) {
                if (sap.ui.Device.orientation.landscape) {
                  var dialog = new sap.m.Dialog({
                    title: 'Aviso smartphone na horizontal',
                    type: 'Message',
                    state: 'Warning',
                    content: new sap.m.Text({
                      text: 'Esse aplicativo foi desenvolvido para funcionamento em formato vertical,' +
                      ' para o modo horizontal algumas informações serão sobrecarregadas'
                    }),
                    beginButton: new sap.m.Button({
                      text: 'OK',
                      press: function press() {
                        dialog.close();
                      }
                    }),
                    afterClose: function afterClose() {
                      dialog.destroy();
                    }
                  });
                  dialog.open();
                }
              });
              this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
              this.oRouter.getTarget("TratamentoDoPonto").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
              sap.ui.getCore().setModel(this, "TratamentoPonto");
              var oEventBus = sap.ui.getCore().getEventBus();
              oEventBus.subscribe("ShiftChangeDialog", "ShiftChange", this.ShiftChangeSelected, this);
              oEventBus.subscribe("SobreAviso", "SobreAviso", this.SobreAvisoSelected, this);
              oEventBus.subscribe("SubsEscala", "SubsEscala", this.SubsEscalaSelected, this);
              oEventBus.subscribe("TelaBancoHoras", "BancoHoras", this.BancoHoras, this);
              oEventBus.subscribe("TelaHorasExtras", "HorasExtras", this.HorasExtras, this);
              oEventBus.subscribe("JustificationDialog", "Justification", this.JustificationSelected, this);
              oEventBus.subscribe("TelaEditarMarcacoes", "MarksEdited", this.MarksEdited, this);
              oEventBus.subscribe("ExcluirMarcacoes", "MarksExcluir", this.MarksExcluir, this);
              this.onChangeFilterButton();
              this.onChangeFilterButtonBH();
              this.onChangeFilterButtonHR();
            },
            _onPointMirrorButtonPress: function _onPointMirrorButtonPress() {
              if (!this._oControl) {
                this._oControl = sap.ui.xmlfragment("com.neo.ZODHR_SS_TIME_G.view.Dialog11", this);
              }
              
              this.getView().addContent(this._oControl);
              
              this._oControl.attachAfterOpen(this._onDialogOpen(this._oControl));
            },
            _onCancelarTroca: function _onCancelarTroca() {
              this._oControl.close();
            },
            _onDialogOpen: function _onDialogOpen(oEvent) {
              if (oEvent) {
                oEvent.open();
                $("#" + oEvent.getContent()[0].getItems()[1].getId()).find(".sapUiCalDatesRow").css("display", "none");
                $("#" + oEvent.getContent()[0].getItems()[1].getId()).find("#calendar--Head-prev").css("display", "none");
                $("#" + oEvent.getContent()[0].getItems()[1].getId()).find("#calendar--Head-next").css("display", "none");
              }
            },
            _onGravarTroca: function _onGravarTroca(oEvent) {
              var me = this;
              var items = this.getSelectedPointTreatmentItems();
              var pernr;
              pernr = items[0].PERNR + ",";
              
              for (var i = 1; i < items.length; i++) {
                pernr = pernr + items[i].PERNR;
                
                if (i + 1 < items.length) {
                  pernr = pernr + ",";
                }
              }
              
              var obj = {
                ano: oEvent.getSource().getParent().getContent()[0].getItems()[1].getStartDate().getFullYear(),
                mes: oEvent.getSource().getParent().getContent()[0].getItems()[1].getStartDate().getMonth() + 1,
                NumeroPessoal: pernr
              };
              var stringParam = "/sap/opu/odata/sap/ZHCM_TREATED_OCURRENCES_COLAB_SRV/ListaImgSet(NumeroPessoal='" + obj.NumeroPessoal +
              "',Mes='" +
              obj.mes + "',Ano='" + obj.ano + "')/$value"; // var aFilters = [];
              
              this._oControl.close();
              
            },
            handleRouteMatched: function handleRouteMatched(oEvent) {
              this.initModels();
            },
            onExit: function onExit() {
              var oEventBus = sap.ui.getCore().getEventBus();
              
              oEventBus.unsubscribe("ShiftChangeDialog", "ShiftChange", this.ShiftChangeSelected, this);
              oEventBus.unsubscribe("SobreAviso", "SobreAviso", this.SobreAvisoSelected, this);
              oEventBus.unsubscribe("SubsEscala", "SubsEscala", this.SubsEscalaSelected, this);
              oEventBus.unsubscribe("TelaBancoHoras", "BancoHoras", this.BancoHoras, this);
              oEventBus.unsubscribe("TelaHorasExtras", "HorasExtras", this.HorasExtras, this);
              oEventBus.unsubscribe("JustificationDialog", "Justification", this.JustificationSelected, this);
              oEventBus.unsubscribe("TelaEditarMarcacoes", "MarksEdited", this.MarksEdited, this);
              oEventBus.unsubscribe("ExcluirMarcacoes", "MarksExcluir", this.MarksExcluir, this);
            }
          });
        });