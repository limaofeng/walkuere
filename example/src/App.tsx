import { hot } from 'react-hot-loader';
import walkuere from 'walkuere';

import modules from './modules';

const App = walkuere({
  modules,
  reduxConfigs: { logging: false }
});

export default hot(module)(App);
