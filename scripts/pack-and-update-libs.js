const packClientLibs = require('./pack-client-libs');
const updateClientLibs = require('./update-client-libs');

packClientLibs(
  [],
  [
    '@cuba-platform/rest',
    '@cuba-platform/react-core',
    '@cuba-platform/react-ui'
  ]
);

updateClientLibs(
  'react-client-scr',
  ['rest', 'react-core', 'react-ui']
);
