app.config(function ($routeProvider) {
    $routeProvider
                .when('/',
                {
                    templateUrl: 'Views/PositionalEntropy.html'
                })

                .when('/DesignPattern',
                {
                    templateUrl: 'Views/DesignPattern.html'
                })

                .when('/Words',
                {
                    templateUrl: 'Views/Words.html'
                })

                .otherwise({ redirectTo: '/' });
});

