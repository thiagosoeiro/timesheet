angular.module('app', ['ionic', 'app.controllers', 'app.jsonDate', 'app.services'])
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })
.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('signin', {
          url: '/sign-in',
          templateUrl: 'templates/autenticacao.html',
          controller: 'LoginController'
      })
      .state('tabs', {
          url: '/tab',
          abstract: true,
          templateUrl: 'templates/tabs.html'
      })

                .state('tabs.timesheet', {
                    url: '/timesheet',
                    views: {
                        'timesheet-tab': {
                            templateUrl: 'templates/timesheet.html',
                            controller: 'TimeSheetController'
                        }
                    }
                })

      .state('tabs.cliente', {
          url: '/cliente',
          views: {
              'timesheet-tab': {
                  templateUrl: 'templates/cliente.html',
                  controller: 'ClienteController'
              }
          }
      })

            .state('tabs.servico', {
                url: '/servico/:clienteCodigo/:clienteNomeFantasia',
                views: {
                    'timesheet-tab': {
                        templateUrl: 'templates/servico.html',
                        controller: 'ServicoController'
                    }
                }
            })

                    .state('tabs.incluirAtividade', {
                        url: '/atividade/:servicoCodigo',
                        views: {
                            'timesheet-tab': {
                                templateUrl: 'templates/incluirAtividade.html',
                                controller: 'IncluirAtividadeController'
                            }
                        }
                    })

      .state('tabs.about', {
          url: '/about',
          views: {
              'about-tab': {
                  templateUrl: 'templates/about.html'
              }
          }
      })
        .state('tabs.ponto', {
            url: '/ponto',
            views: {
                'ponto-tab': {
                    templateUrl: 'templates/ponto.html'
                }
            }
        })
      //.state('tabs.contact', {
      //    url: '/contact',
      //    views: {
      //        'contact-tab': {
      //            templateUrl: 'templates/contact.html'
      //        }
      //    }
      //})
    
    $urlRouterProvider.otherwise('/sign-in');
})

