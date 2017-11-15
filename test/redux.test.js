import { redux } from './../src';

const { createReduxStore } = redux;

console.log(redux, createReduxStore);

const reduxStore = redux({});

console.log(reduxStore());
