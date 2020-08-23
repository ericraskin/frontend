const packClientLibs = require('./pack-client-libs');
const updateClientLibs = require('./update-client-libs');
const genReactClientScr = require('./generate-react-client-scr');

async function genPackAndUpdate() {

  await genReactClientScr();

  await packClientLibs(
    [],
    [
      '@cuba-platform/rest',
      '@cuba-platform/react-core',
      '@cuba-platform/react-ui'
    ]
  );

  await updateClientLibs(
    'react-client-scr',
    ['rest', 'react-core', 'react-ui']
  );

}

return genPackAndUpdate();
