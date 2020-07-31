import PropTypes from '../_util/vue-types';
import BaseMixin from '../_util/BaseMixin';
import { ConfigConsumerProps } from '../config-provider';
import ResponsiveObserve from '../_util/responsiveObserve';

const RowProps = {
  gutter: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  type: PropTypes.oneOf(['flex']),
  align: PropTypes.oneOf(['top', 'middle', 'bottom', 'stretch']),
  justify: PropTypes.oneOf(['start', 'end', 'center', 'space-around', 'space-between']),
  prefixCls: PropTypes.string,
};

const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

export default {
  name: 'ARow',
  mixins: [BaseMixin],
  props: {
    ...RowProps,
    gutter: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]).def(0),
  },
  provide() {
    return {
      rowContext: this,
    };
  },
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  data() {
    return {
      screens: {},
    };
  },

  mounted() {
    this.$nextTick(() => {
      // 获取屏幕的栅格尺寸
      this.token = ResponsiveObserve.subscribe(screens => {
        const { gutter } = this;
        if (
          typeof gutter === 'object' ||
          (Array.isArray(gutter) &&
            (typeof gutter[0] === 'object' || typeof gutter[1] === 'object'))
        ) {
          this.screens = screens;
        }
      });
    });
  },
  beforeDestroy() {
    ResponsiveObserve.unsubscribe(this.token);
  },
  methods: {
    // 根据屏幕尺寸和参数gutter计算正确的[水平间距, 垂直间距]
    getGutter() {
      const results = [0, 0];
      const { gutter, screens } = this;
      // 格式化gutter为 [水平间距, 垂直间距]
      const normalizedGutter = Array.isArray(gutter) ? gutter : [gutter, 0];
      normalizedGutter.forEach((g, index) => {
        // item是对象，则根据屏幕尺寸算出当前屏幕尺寸最大的值
        if (typeof g === 'object') {
          for (let i = 0; i < responsiveArray.length; i++) {
            const breakpoint = responsiveArray[i];
            // 当前断点在屏幕尺寸中且gutter中有设置该尺寸的间距值，则取出对应的值
            // 因为屏幕的断点值是由大到小排的，所以取出该值后即可跳出循环
            if (screens[breakpoint] && g[breakpoint] !== undefined) {
              results[index] = g[breakpoint];
              break;
            }
          }
        } else {
          // 如果item非对象，则意味着是个数字，直接取值
          results[index] = g || 0;
        }
      });
      return results;
    },
  },

  render() {
    const { type, justify, align, prefixCls: customizePrefixCls, $slots } = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('row', customizePrefixCls);
    // 正确的[水平间距, 垂直间距]
    const gutter = this.getGutter();
    const classes = {
      [prefixCls]: !type,
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${type}-${justify}`]: type && justify,
      [`${prefixCls}-${type}-${align}`]: type && align,
    };
    // gutter参数不为空，以左右padding为例，item需要添加左右的间距，
    // 但是第一个和最后一个子元素不需要有左右内边距，所以父元素设置相同的负值的margin，
    // 这样可以抵消两端的padding
    const rowStyle = {
      ...(gutter[0] > 0
        ? {
            marginLeft: `${gutter[0] / -2}px`,
            marginRight: `${gutter[0] / -2}px`,
          }
        : {}),
      ...(gutter[1] > 0
        ? {
            marginTop: `${gutter[1] / -2}px`,
            marginBottom: `${gutter[1] / -2}px`,
          }
        : {}),
    };
    return (
      <div class={classes} style={rowStyle}>
        {$slots.default}
      </div>
    );
  },
};
