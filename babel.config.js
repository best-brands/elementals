module.exports = function (api) {
    api.cache(true);

    const presets = [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "corejs": 3,
            }
        ]
    ];

    const sourceType = "unambiguous";

    const plugins = [
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-transform-arrow-functions",
        "@babel/plugin-transform-async-to-generator",
        "@babel/plugin-transform-classes",
        "@babel/plugin-transform-destructuring",
        "@babel/plugin-transform-exponentiation-operator",
        "@babel/plugin-transform-literals",
        "@babel/plugin-transform-parameters",
        "@babel/plugin-transform-property-mutators",
        "@babel/plugin-transform-shorthand-properties",
        "@babel/plugin-transform-spread",
        "@babel/plugin-transform-template-literals",
        "@babel/plugin-transform-typeof-symbol",
        "@babel/plugin-proposal-object-rest-spread"
    ];

    const env = {
        "production": {
            "presets": ["minify"]
        }
    };

    return {
        presets,
        plugins,
        sourceType,
        env
    }
};
