# Walkuere

Redux + React-Router + Apollo (graphql)

## Getting Started

```shell
npm install walkuere
```

## Basic Usage

```js
import walkuere from 'walkuere';

import modules from './modules';

const App = walkuere({
  modules,
  reduxConfigs: { logging: false }
});
```