module.exports = {
  replacePrefix: '/<%= basePath %>/',
  staticFileGlobs: [
    'index.html',
    'src/**.html',
    'images/*',
    'manifest.json',
    'bower_components/webcomponentsjs/webcomponents-loader.js',
    'bower_components/fetch/fetch.js'
  ],
  navigateFallback: 'index.html'
};
