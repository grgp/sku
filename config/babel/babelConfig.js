const { cwd } = require('../../lib/cwd');

module.exports = ({
  target,
  lang = 'js',
  supportedBrowsers,
  displayNamesProd = false,
  removeAssertionsInProduction = true,
  hot = false,
}) => {
  const browserEnvOptions = {
    modules: false,
    targets: supportedBrowsers,
  };

  const nodeEnvOptions = {
    targets: {
      node: 'current',
    },
  };

  const isBrowser = target === 'browser';
  const isJest = target === 'jest';
  const isProductionBuild = process.env.NODE_ENV === 'production';

  const envPresetOptions = isBrowser ? browserEnvOptions : nodeEnvOptions;
  const plugins = [
    require.resolve('babel-plugin-syntax-dynamic-import'),
    ...(!isProductionBuild && lang === 'js'
      ? [require.resolve('babel-plugin-flow-react-proptypes')]
      : []),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    [
      require.resolve('babel-plugin-module-resolver'),
      { root: [cwd()], extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] },
    ],
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('babel-plugin-macros'),
    require.resolve('@loadable/babel-plugin'),
    [require.resolve('babel-plugin-treat'), { alias: 'sku/treat' }],
  ];

  if (hot && isBrowser) {
    plugins.push([
      require.resolve('react-refresh/babel'),
      { skipEnvCheck: true },
    ]);
  }

  if (isBrowser) {
    plugins.push(require.resolve('babel-plugin-seek-style-guide'));
  }

  if (isJest) {
    plugins.push(require.resolve('babel-plugin-dynamic-import-node'));
  }

  if (isProductionBuild) {
    plugins.push(
      require.resolve('@babel/plugin-transform-react-inline-elements'),
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
      require.resolve('@babel/plugin-transform-react-constant-elements'),
    );

    if (displayNamesProd) {
      plugins.push(require.resolve('babel-plugin-add-react-displayname'));
    }

    if (removeAssertionsInProduction) {
      plugins.push(require.resolve('babel-plugin-unassert'));
    }
  }

  const languagePreset =
    lang === 'ts'
      ? [
          require.resolve('@babel/preset-typescript'),
          {
            isTSX: true,
            allExtensions: true,
          },
        ]
      : require.resolve('@babel/preset-flow');

  return {
    babelrc: false,
    sourceType: isBrowser ? 'unambiguous' : 'module',
    presets: [
      languagePreset,
      [require.resolve('@babel/preset-env'), envPresetOptions],
      require.resolve('@babel/preset-react'),
    ],
    plugins,
  };
};
