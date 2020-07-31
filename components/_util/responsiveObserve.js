// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82
let enquire;

// 兼容IE9及以下
// TODO: Will be removed in antd 4.0 because we will no longer support ie9
if (typeof window !== 'undefined') {
  const matchMediaPolyfill = mediaQuery => {
    return {
      media: mediaQuery,
      matches: false,
      addListener() {},
      removeListener() {},
    };
  };
  //IE9及以下 window.matchMedia 为 undefined
  // ref: https://github.com/ant-design/ant-design/issues/18774
  if (!window.matchMedia) window.matchMedia = matchMediaPolyfill;
  // eslint-disable-next-line global-require
  enquire = require('enquire.js');
}

export const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

export const responsiveMap = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
};

let subscribers = []; // 订阅列表
let subUid = -1; // 最大的订阅token
let screens = {}; // 当前屏幕尺寸，例: {lg: true, md: true, sm: true}

const responsiveObserve = {
  // 分发事件
  dispatch(pointMap) {
    // 记录屏幕的Map
    screens = pointMap;
    // 无订阅者直接返回
    if (subscribers.length < 1) {
      return false;
    }
    // 遍历订阅者，执行每个订阅者的回调函数
    subscribers.forEach(item => {
      item.func(screens);
    });
    return true;
  },
  // 订阅
  subscribe(func) {
    console.log('this is subscribe', func);
    // 之前无订阅者就先注册事件
    if (subscribers.length === 0) {
      this.register();
    }
    // 获取当前订阅者的token，唯一标识
    const token = (++subUid).toString();
    // 记录订阅者的token和回调函数
    subscribers.push({
      token,
      func,
    });
    // 执行回调函数
    func(screens);
    // 返回当前订阅者的token，订阅组件销毁时，可以根据token取消订阅
    return token;
  },
  unsubscribe(token) {
    // 取消订阅事件
    subscribers = subscribers.filter(item => item.token !== token);
    if (subscribers.length === 0) {
      this.unregister();
    }
  },
  // 取消注册
  unregister() {
    console.log('this is unregister');
    Object.keys(responsiveMap).map(screen => enquire.unregister(responsiveMap[screen]));
  },
  register() {
    // 遍历responsiveMap, 用enquire组件监听页面，判断各个断点，得到正确的pointMap，
    // 例如 {xxl: false, xl: false, lg: true, md: true, sm: true, xs: true}
    console.log('this is register');
    Object.keys(responsiveMap).map(screen =>
      enquire.register(responsiveMap[screen], {
        match: () => {
          const pointMap = {
            ...screens,
            [screen]: true,
          };
          this.dispatch(pointMap);
        },
        unmatch: () => {
          const pointMap = {
            ...screens,
            [screen]: false,
          };
          this.dispatch(pointMap);
        },
        // Keep a empty destroy to avoid triggering unmatch when unregister
        destroy() {},
      }),
    );
  },
};

export default responsiveObserve;
