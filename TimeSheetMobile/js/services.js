angular.module('app.services', [])
.factory('TimeSheetServices', function ($http) {
    URL_CONST = 'http://10.1.25.88/INSIX.DINSIX.WAP/SVCTimeSheetJson.svc/';
    CH_TIMETRACKER_CONST = 'D033E22AE348AEB5660FC2140AEC35850C4DA997';

    return {
        consultarProfissionalPorLogin: function (nom_login_prf, senha) {
            url_webservice = URL_CONST + 'ConsultarProfissionalPorLoginJSON?param0=' + CH_TIMETRACKER_CONST + '&param1=' + nom_login_prf + '&param2=' + senha;
            return $http.get(url_webservice).then(function (resp) {
                return resp;
            });
        },
        listarTimetrackerPorData: function (data, cod_profissional_prf) {
            url_webservice = URL_CONST + 'ListarTimetrackerPorDataJSON?param0=' + CH_TIMETRACKER_CONST + '&param1=' + data + '&param2=' + cod_profissional_prf;
            return $http.get(url_webservice).then(function (resp) {
                return resp;
            });
        },
        listarClienteTimeSheet: function () {
            url_webservice = URL_CONST + 'ListarClienteTimeSheetJSON?param0=' + CH_TIMETRACKER_CONST;
            return $http.get(url_webservice).then(function (resp) {
                return resp;
            });
        },
        listarServicoClienteTimeSheet: function (cod_cliente_cli) {
            url_webservice = URL_CONST + 'ListarServicoClienteTimeSheetJSON?param0=' + CH_TIMETRACKER_CONST + '&param1=' + cod_cliente_cli;
            return $http.get(url_webservice).then(function (resp) {
                return resp;
            });
        },
        incluirTimetracker: function (dadosJson) {
            url_webservice = URL_CONST + 'IncluirTimetrackerJSON?param0=' + CH_TIMETRACKER_CONST + '&param1=' + dadosJson;
            return $http.post(url_webservice).then(function (resp) {
                return resp;
            });
        },
        alterarTimetracker: function (dadosJson) {
            url_webservice = URL_CONST + 'AlterarTimetrackerJSON?param0=' + CH_TIMETRACKER_CONST + '&param1=' + dadosJson;
            return $http.put(url_webservice).then(function (resp) {
                return resp;
            });
        },
        excluirTimetracker: function (codigoTimeTracker) {
            url_webservice = URL_CONST + 'ExcluirTimetrackerJSON?param0=' + CH_TIMETRACKER_CONST + '&param1=' + codigoTimeTracker;
            return $http.delete(url_webservice).then(function (resp) {
                return resp;
            });
        },
        listarPontoMesPorFiltro: function (dataInicioPonto, dataFinalPonto, cod_profissional_prf) {
            url_webservice = URL_CONST + 'ListarPontoMesPorFiltroJSON?param0=' + CH_TIMETRACKER_CONST + '&param1=' + dataInicioPonto + '&param2=' + dataFinalPonto + '&param3=' + cod_profissional_prf;
            return $http.get(url_webservice).then(function (resp) {
                return resp;
            });
        },
    }
})

