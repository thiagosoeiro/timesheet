angular.module('app.controllers', ['app.jsonDate', 'app.services'])

    .controller('LoginController', function ($scope, $state, $http, TimeSheetServices, $ionicPopup) {
        localStorage.setItem('horaInicialPesquisa', null);
        localStorage.setItem('horaFinal', null);
        localStorage.setItem('horaInicial', null);
        localStorage.setItem('dataPesquisa', null);
        localStorage.setItem('profissional', null);

        localStorage.setItem('acao', null); //reseta a acao (alterar, copiar)
        localStorage.setItem('atividadeActionSheet', null); //reseta a atividade (alterar, copiar)

        $scope.login = function (user) {
            TimeSheetServices.consultarProfissionalPorLogin(user.username, user.password).then(function (resp) {
                if (resp.data.codigoProfissional > 0) {
                    //TEMPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
                    //localStorage.setItem('horaInicialPesquisa', null);
                    //localStorage.setItem('horaFinal', null);
                    //localStorage.setItem('horaInicial', null);
                    //Adiciona o objeto json do profissional na sessão
                    localStorage.setItem('profissional', JSON.stringify(resp.data));
                    //localStorage.setItem('dataPesquisa', null);
                    $state.go('tabs.timesheet');
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Usuário inexistente!',
                        template: ''
                    });
                    alertPopup.then(function (res) {
                        //$scope.user = null;
                    });
                }
            }, function (err) {
                console.error('Erro', err);
                $scope.status = 'Não foi possível obter os dados: ' + error.message;
            })
        }
    })
    .controller('TimeSheetController', function ($scope, $state, $http, $stateParams, $filter, TimeSheetServices, $ionicActionSheet, $timeout, $ionicPopup) {
        var dataPesquisa = localStorage.getItem('dataPesquisa');
        if (dataPesquisa == 'null' || angular.isUndefined(dataPesquisa)) {
            $scope.date = $filter("date")(Date.now(), 'yyyy-MM-dd');
        } else { $scope.date = dataPesquisa; }
        localStorage.setItem('dataInicio', $scope.date);
        localStorage.setItem('dataFim', $scope.date);
        localStorage.setItem('acao', null); //reseta a acao (alterar, copiar)
        localStorage.setItem('atividadeActionSheet', null); //reseta a atividade (alterar, copiar)
        //Obtém o objeto JSON do profissional da sessão
        var codigoProfissional = JSON.parse(localStorage.getItem('profissional')).codigoProfissional;
        var datInicio; 
        var datFim;
        var dtpData = $scope.date;
        var dtpInicio; //componente interface para proximo consulta
        var dtpFinal; //componente interface para proximo consulta
        var dtpInicioBACKUP;
        TimeSheetServices.listarTimetrackerPorData(dtpData, codigoProfissional).then(function (respT) {
            $scope.atividades = respT.data;
            dtpInicio = dtpData + ' ' + '00:00';
            dtpFinal = dtpData + ' ' + '00:00';
            localStorage.setItem('horaInicial', '00:00');
            localStorage.setItem('horaFinal', '00:00');
                              
            if (dtpData == $filter("date")(Date.now(), 'yyyy-MM-dd')) {
                localStorage.setItem('horaFinal', $filter("date")(Date.now(), 'HH:mm'));
                dtpFinal = $filter("date")(Date.now(), 'yyyy-MM-dd HH:mm'); //
            }
            if (!angular.isUndefined(respT.data[0])) {
                localStorage.setItem('horaInicial', $filter("jsonDate")(respT.data[0].dataFim, 'HH:mm'));
                dtpInicio = $filter("jsonDate")(respT.data[0].dataFim, 'yyyy-MM-dd HH:mm'); //
                dtpInicioBACKUP = dtpInicio;
            }
            //else { dateHour = $filter("date")($scope.date, 'yyyy-MM-dd HH:mm'); }
            //var dataInicioTemp; var dataFinalTemp;
            //var horaInicialPesquisa = localStorage.getItem('horaInicialPesquisa');
            //if (horaInicialPesquisa == 'null' || horaInicialPesquisa == null || angular.isUndefined(horaInicialPesquisa)) {
            //    //dateHour = $filter("date")($scope.date, 'yyyy-MM-dd HH:mm');
            //}
            ////else { dateHour = horaInicialPesquisa };
            datPonto = dtpData + ' ' + '00:00';
            TimeSheetServices.listarPontoMesPorFiltro(datPonto, dtpData, codigoProfissional).then(function (resp) {

                if (!angular.isUndefined(resp.data[0])) {
                    //DEFINE HORA DE INICIO COM BASE NO PONTO (COLUNA IMPAR)
                    datInicio = dtpInicio;
                    for (var i in resp.data) {
                        if (($filter("jsonDate")(resp.data[i].dataPonto, 'yyyy-MM-dd HH:mm') > dtpInicio) && ((parseInt(i) + 1) % 2 != 0)) {
                            datInicio = $filter("jsonDate")(resp.data[i].dataPonto, 'yyyy-MM-dd HH:mm');
                            localStorage.setItem('horaInicial', $filter("jsonDate")(resp.data[i].dataPonto, 'HH:mm'))
                            break;
                        }
                    }
                }
                //DEFINE HORA DE FIM COM BASE NO PONTO (COLUNA PAR)
                var tmpDate = new Date($filter("date")(dtpInicio, 'yyyy-MM-dd HH:mm'));
                tmpDate.setMinutes(tmpDate.getMinutes() + 1);
                var dateHourPlusOneMinute = $filter("date")(tmpDate, 'yyyy-MM-dd HH:mm');
                if (!angular.isUndefined(resp.data[1])) {
                    datFim = dtpFinal;
                    for (var i in resp.data) {
                        if (($filter("jsonDate")(resp.data[i].dataPonto, 'yyyy-MM-dd HH:mm') > dateHourPlusOneMinute) && ((parseInt(i) + 1) % 2 == 0)) {
                            datFim = $filter("jsonDate")(resp.data[i].dataPonto, 'yyyy-MM-dd HH:mm');
                            dtpFinal = $filter("jsonDate")(resp.data[i].dataPonto, 'yyyy-MM-dd HH:mm');
                            localStorage.setItem('horaFinal', $filter("jsonDate")(resp.data[i].dataPonto, 'HH:mm'))
                            break;
                        }
                    }
                }               
                if (datInicio > datFim) {
                    datInicio = dtpInicioBACKUP;
                    var tmpDate = new Date($filter("date")(datInicio, 'yyyy-MM-dd HH:mm'));
                    localStorage.setItem('horaInicial', $filter("date")(tmpDate, 'HH:mm'));
                }

                if (datInicio < datFim) {
                    dtpInicio = datInicio;
                    localStorage.setItem('horaInicialPesquisa', dtpInicio);
                }
                
            }, function (err) {
                $scope.status = 'Não foi possível obter os dados:  ' + error.message;
            });
            //Caso o dia seja hoje e NÃO haja registros atividade entao horaInicial será hora do ponto.
            //if ($scope.date == $filter("date")(Date.now(), 'yyyy-MM-dd') && angular.isUndefined(resp.data[0])) {
            //var dateHour = $filter("date")($scope.date, 'yyyy-MM-dd HH:mm');
            //TimeSheetServices.listarPontoMesPorFiltro(dateHour, $scope.date, codigoProfissional).then(function (resp) {
            //    if (!angular.isUndefined(resp.data[0])) {
            //        var horaInicialVar = $filter("jsonDate")(resp.data[0].dataPonto, 'HH:mm');
            //        localStorage.setItem('horaInicial', horaInicialVar);
            //    }
            //    if (!angular.isUndefined(resp.data[1])) {
            //        var horaInicialVar = $filter("jsonDate")(resp.data[1].dataPonto, 'HH:mm');
            //        localStorage.setItem('horaFinal', horaInicialVar);
            //    } else {
            //        localStorage.setItem('horaFinal', $filter("date")(Date.now(), 'HH:mm'));
            //    }                  
            //}, function (err) {
            //    $scope.status = 'Não foi possível obter os dados:  ' + error.message;
            //});
            //}
        }, function (err) {
            $scope.status = 'Não foi possível obter os dados:  ' + error.message;
        });

        $scope.manterAtividade = function (atividade) {
            var hideSheet = $ionicActionSheet.show({
                buttons: [{ text: 'Alterar' }, { text: 'Copiar' }, ],
                destructiveText: 'Excluir',
                titleText: 'O que deseja fazer?',
                cancelText: 'Cancelar',
                //cancel: function () {
                //    // não faz nada..
                //},
                buttonClicked: function (index) {
                    if (index == 0 || index == 1) {//alterar (acao = 0) , copiar (acao = 1) 
                        localStorage.setItem('acao', index);
                        localStorage.setItem('atividadeActionSheet', JSON.stringify(atividade));
                        $state.go('tabs.incluirAtividade');
                        return true;
                    }
                },
                destructiveButtonClicked: function () {
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Tem certeza que deseja excluir o registro?',
                        template: ''
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            /////
                            TimeSheetServices.excluirTimetracker(atividade.codigoTimeTracker).then(function (resp) {
                                $state.go($state.current, {}, { reload: true });
                            }, function (err) {
                                console.error('Erro', err);
                                $scope.status = 'Não foi possível excluir os dados:  ' + error.message;
                            })
                        } else {
                            // nao faz nada
                        }
                    });
                    return true;
                }
            })
            $timeout(function () {
                hideSheet();
            }, 2000);

        };
        //Usar em conjunto com biblioteca ui.grid apenas
        //$scope.gridOptions = {
        //    data: 'atividades',
        //    columnDefs: [
        //    { field: 'dataInicio', displayName: 'Início' },
        //    { field: 'dataFim', displayName: 'Fim' },
        //    { field: 'nomeCliente', displayName: 'Cliente' },
        //    { field: 'descricaoAtividade', displayName: 'Atividade' }
        //    ],
        //    enableColumnResize: false,
        //    enableColumnReordering: false,     
        //    enableColumnHeavyVirt: false,    
        //    enablePaging: false,       
        //    enablePinning: false,       
        //    enableRowReordering: false,        
        //    enableRowSelection: false,        
        //    enableSorting: false,
        //    multiSelect: false,
        //    showGroupPanel: false
        //};
        $scope.pesquisarAtividades = function (date) {
            localStorage.setItem('horaInicialPesquisa', null);
            localStorage.setItem('horaFinal', null);
            localStorage.setItem('horaInicial', null);
            //Se a data selecionada for hoje, nao faz nada e atualiza a view.
            if (date == $filter("date")(Date.now(), 'yyyy-MM-dd')) {
                localStorage.setItem('dataPesquisa', null);                
            } else {
                localStorage.setItem('dataPesquisa', date);
            }
            $state.go($state.current, {}, { reload: true });
            //TimeSheetServices.listarTimetrackerPorData(date, codigoProfissional).then(function (resp) {
            //    localStorage.setItem('dataInicio', date);
            //    localStorage.setItem('dataFim', date);
            //    $scope.atividades = resp.data;
            //    //Caso haja registros de atividade entao horaInicial será horafinal da 
            //    //ultima atividade registrada. 
            //    //Hora Final será 00:00
            //    if (!angular.isUndefined(resp.data[0])) {
            //        localStorage.setItem('horaInicial', $filter("jsonDate")(resp.data[0].dataFim, 'HH:mm'));
            //        localStorage.setItem('horaFinal', '00:00');
            //    }
            //    //Caso NãO haja registros de atividade entao horaInicial será hora do ponto. 
            //    //Hora final será hora do ponto.
            //    if (angular.isUndefined(resp.data[0])) {
            //        var dateHour = $filter("date")(date, 'yyyy-MM-dd HH:mm');
            //        TimeSheetServices.listarPontoMesPorFiltro(dateHour, date, codigoProfissional).then(function (resp) {
            //            if (!angular.isUndefined(resp.data[0])) {
            //                var horaInicialVar = $filter("jsonDate")(resp.data[0].dataPonto, 'HH:mm');
            //                localStorage.setItem('horaInicial', horaInicialVar);
            //            }
            //            if (!angular.isUndefined(resp.data[1])) {
            //                var horaFinalVar = $filter("jsonDate")(resp.data[1].dataPonto, 'HH:mm');
            //                localStorage.setItem('horaFinal', horaFinalVar);
            //            }
            //        }, function (err) {
            //            $scope.status = 'Não foi possível obter os dados:  ' + error.message;
            //        });
            //    }

            //}, function (err) {
            //    console.error('Erro', err);
            //    $scope.status = 'Não foi possível obter os dados:  ' + error.message;
            //});       
    };
})
.controller('ClienteController', function ($scope, $http, TimeSheetServices) {
    $scope.data = {};
    TimeSheetServices.listarClienteTimeSheet().then(function (resp) {
        console.log('Success', resp);
        $scope.clientes = resp.data;
    }, function (err) {
        console.error('Erro', err);
        $scope.status = 'Não foi possível obter os dados:  ' + error.message;
    })
    $scope.clearSearch = function () {
        $scope.data.searchQuery = '';
    };
})
.controller('ServicoController', function ($scope, $http, $stateParams, TimeSheetServices) {
    $scope.data = {};
    var codigoCliente = $stateParams.clienteCodigo;
    var nomeCliente = $stateParams.clienteNomeFantasia;
    //Adiciona o código do cliente na sessão
    localStorage.setItem('codigoCliente', codigoCliente);
    //Adiciona o nome código do cliente na sessão
    localStorage.setItem('nomeCliente', nomeCliente);
    $scope.nomeFantasia = nomeCliente;
    TimeSheetServices.listarServicoClienteTimeSheet(codigoCliente).then(function (resp) {
        console.log('Success', resp);
        $scope.servicos = resp.data;
    }, function (err) {
        console.error('Erro', err);
        $scope.status = 'Não foi possível obter os dados:  ' + error.message;
    })
    $scope.clearSearch = function () {
        $scope.data.searchQuery = '';
    };
})
.controller('IncluirAtividadeController', function ($scope, $state, $http, $stateParams, TimeSheetServices, $ionicPopup, $filter) {
    //AO CARREGAR A VIEW
    $scope.titulo = 'Incluir Atividade';
    $scope.tituloBotao = 'Incluir';
    var acao = localStorage.getItem('acao');
    var atividadeActionSheet = JSON.parse(localStorage.getItem('atividadeActionSheet'));
    if (!(atividadeActionSheet == null) && !(acao == 'null')) {
        if (acao == 0) { //ALTERAR
            var TESTEdataInicial = $filter("jsonDate")(atividadeActionSheet.dataInicio, 'dd-MM-yyyy');
            var TESTEdataFinal = $filter("jsonDate")(atividadeActionSheet.dataFim, 'dd-MM-yyyy');

            $scope.horaInicial = $filter("jsonDate")(atividadeActionSheet.dataInicio, 'HH:mm');
            $scope.horaFinal = $filter("jsonDate")(atividadeActionSheet.dataFim, 'HH:mm');
            $scope.atividadeTexto = atividadeActionSheet.descricaoAtividade;
            $scope.titulo = 'Alterar Atividade';
            $scope.tituloBotao = 'Alterar';
        }
        if (acao == 1) { //COPIAR
            //PEGA O VALOR DA HORA FINAL DA SESSÃO
            $scope.horaInicial = localStorage.getItem('horaInicial');
            $scope.horaFinal = localStorage.getItem('horaFinal');
            $scope.atividadeTexto = atividadeActionSheet.descricaoAtividade;
        }
    } else {
        //PEGA O VALOR DA HORA FINAL DA SESSÃO
        $scope.horaInicial = localStorage.getItem('horaInicial');
        $scope.horaFinal = localStorage.getItem('horaFinal');
    }
    //BOTÃO INCLUIR
    $scope.incluir = function (atividadeTexto, horaInicial, horaFinal) {
        var jsonString;
        //INCLUIR OU COPIAR?
        if (acao == 'null' || acao == 1) {
            //SEM ACAO = INCLUIR
            if (acao == 'null') {
                if (!angular.isUndefined(atividadeTexto)) {
                    var dataInicio = localStorage.getItem('dataInicio') + ' ' + horaInicial;
                    var dataFim = localStorage.getItem('dataFim') + ' ' + horaFinal;
                    var codigoCliente = localStorage.getItem('codigoCliente');
                    var codigoServico = $stateParams.servicoCodigo;
                    var descricaoAtividade = atividadeTexto;
                    //passagem do JSON de inclusão para o webservice
                    jsonString = '{"dat_inicio_tra":"' + dataInicio + '","dat_fim_tra":"' + dataFim + '","des_atividade_tra":"' + descricaoAtividade + '","cod_cliente_cli":' + codigoCliente + ',"cod_profissional_prf":' + JSON.parse(localStorage.getItem('profissional')).codigoProfissional + ',"cod_servico_cliente_sec":' + codigoServico + ',"flg_urgencia_tra":false,"flg_treinamento_tra":false}';
                }
            }
            //ACAO = 1 COPIAR
            if (acao == 1) {
                if (!angular.isUndefined(atividadeTexto)) {
                    var dataInicio = localStorage.getItem('dataInicio') + ' ' + horaInicial;
                    var dataFim = localStorage.getItem('dataFim') + ' ' + horaFinal;
                    var descricaoAtividade = atividadeTexto;
                    //passagem do JSON de inclusão para o webservice
                    jsonString = '{"dat_inicio_tra":"' + dataInicio + '","dat_fim_tra":"' + dataFim + '","des_atividade_tra":"' + descricaoAtividade + '","cod_cliente_cli":' + atividadeActionSheet.codigoCliente + ',"cod_profissional_prf":' + atividadeActionSheet.codigoProfissional + ',"cod_servico_cliente_sec":' + atividadeActionSheet.codigoServicoCliente + ',"flg_urgencia_tra":false,"flg_treinamento_tra":false}';
                }
            }
            if (horaInicial > horaFinal) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Hora final não pode ser inferior a hora inicial.',
                    template: ''
                });
                alertPopup.then(function (res) {
                    //nao faz nada
                });
            } else {
                TimeSheetServices.incluirTimetracker(jsonString).then(function (resp) {
                    //AQUI PENDENTE: DEFINIR OS NOVOS HORARIOS INICIAL E FINAL NA SESSÃO
                    var alertPopup = $ionicPopup.alert({
                        title: 'Atividade inserida com sucesso!',
                        template: ''
                    });
                    alertPopup.then(function (res) {
                        $state.go('tabs.timesheet');
                    });
                }, function (err) {
                    console.error('Erro', err);
                    $scope.status = 'Não foi possível inserir os dados:  ' + error.message;
                })
            }
        }
        //ACAO = 0 ALTERAR
        if (acao == 0) {
            if (!angular.isUndefined(atividadeTexto)) {
                var dataInicio = localStorage.getItem('dataInicio') + ' ' + horaInicial;
                var dataFim = localStorage.getItem('dataFim') + ' ' + horaFinal;
                var descricaoAtividade = atividadeTexto;
                //passagem do JSON de inclusão para o webservice
                jsonString = '{"dat_inicio_tra":"' + dataInicio + '","dat_fim_tra":"' + dataFim + '","des_atividade_tra":"' + descricaoAtividade + '","cod_cliente_cli":' + atividadeActionSheet.codigoCliente + ',"cod_profissional_prf":' + atividadeActionSheet.codigoProfissional + ',"cod_servico_cliente_sec":' + atividadeActionSheet.codigoServicoCliente + ',"cod_timetracker_tra":' + atividadeActionSheet.codigoTimeTracker + ',"flg_urgencia_tra":false,"flg_treinamento_tra":false}';
                TimeSheetServices.alterarTimetracker(jsonString).then(function (resp) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Atividade alterada com sucesso!',
                        template: ''
                    });
                    alertPopup.then(function (res) {
                        $state.go('tabs.timesheet');
                    });
                }, function (err) {
                    console.error('Erro', err);
                    $scope.status = 'Não foi possível alterar os dados:  ' + error.message;
                })
            }
        }
    }
})
//módulo para validação e máscara de campos data
angular.module('app.jsonDate', []).filter('jsonDate', function ($filter) {
    return function (input, format) {
        return $filter('date')(parseInt(input.substr(6)), format);
    };
});
