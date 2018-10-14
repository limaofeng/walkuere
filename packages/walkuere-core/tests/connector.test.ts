import Connector from '../src/connector';

describe('Connector', () => {
  const feature = new Connector({
    namespace: 'home',
    state: {
      title: 'Home'
    },
    reducers: {
      setTitle() {
        // tslint:disable-next-line:no-console
        console.log('xxx');
      }
    }
  });

  const x = new Connector(feature, feature);

  it('reducers', async () => {
    expect(feature.reducers.home).not.toBeUndefined();
  });
});
