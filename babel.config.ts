
module.exports = function (api: any) {
    api.cache(false);
    return {
        plugins: [
            [
                'module:react-native-dotenv',
                {
                    envName: 'APP_ENV',
                    moduleName: '@env',
                    path: '.env',
                },
            ],
        ],
    };
};