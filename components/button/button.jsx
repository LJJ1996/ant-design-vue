import Wave from '../_util/wave';
import Icon from '../icon';
import buttonTypes from './buttonTypes';
import { filterEmpty, getListeners, getComponentFromProp } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';

const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
const props = buttonTypes();
export default {
  name: 'AButton',
  inheritAttrs: false,
  __ANT_BUTTON: true,
  props,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  data() {
    return {
      sizeMap: {
        large: 'lg',
        small: 'sm',
      },
      sLoading: !!this.loading,
      hasTwoCNChar: false,
    };
  },
  computed: {
    // 动态计算class
    classes() {
      const {
        prefixCls: customizePrefixCls,
        type,
        shape,
        size,
        hasTwoCNChar,
        sLoading,
        ghost,
        block,
        icon,
        $slots,
      } = this;
      const getPrefixCls = this.configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('btn', customizePrefixCls);
      const autoInsertSpace = this.configProvider.autoInsertSpaceInButton !== false;

      // large => lg
      // small => sm
      let sizeCls = '';
      switch (size) {
        case 'large':
          sizeCls = 'lg';
          break;
        case 'small':
          sizeCls = 'sm';
          break;
        default:
          break;
      }
      const iconType = sLoading ? 'loading' : icon;
      const children = filterEmpty($slots.default);
      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-${type}`]: type,
        [`${prefixCls}-${shape}`]: shape,
        [`${prefixCls}-${sizeCls}`]: sizeCls,
        [`${prefixCls}-icon-only`]: children.length === 0 && iconType,
        [`${prefixCls}-loading`]: sLoading,
        [`${prefixCls}-background-ghost`]: ghost || type === 'ghost',
        [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && autoInsertSpace,
        [`${prefixCls}-block`]: block,
      };
    },
  },
  watch: {
    // 监听button props中的loading值变化
    loading(val, preVal) {
      console.log(val, preVal);
      // preVal 之前是 {delay: **}，则清除之前的延迟定时器
      if (preVal && typeof preVal !== 'boolean') {
        clearTimeout(this.delayTimeout);
      }
      // val 是 {delay: **}，则使用延迟定时器
      if (val && typeof val !== 'boolean' && val.delay) {
        this.delayTimeout = setTimeout(() => {
          this.sLoading = !!val;
        }, val.delay);
      } else {
        this.sLoading = !!val;
      }
    },
  },
  mounted() {
    this.fixTwoCNChar();
  },
  updated() {
    this.fixTwoCNChar();
  },
  beforeDestroy() {
    // if (this.timeout) {
    //   clearTimeout(this.timeout)
    // }
    // 实例销毁之前清除定时器
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
    }
  },
  methods: {
    // 判断button内容中是否有两个中文汉字
    fixTwoCNChar() {
      // Fix for HOC usage like <FormatMessage />
      const node = this.$refs.buttonNode;
      if (!node) {
        return;
      }
      // 获取button内容
      const buttonText = node.textContent;
      // 判断是否是两个中文汉字
      if (this.isNeedInserted() && isTwoCNChar(buttonText)) {
        if (!this.hasTwoCNChar) {
          this.hasTwoCNChar = true;
        }
      } else if (this.hasTwoCNChar) {
        this.hasTwoCNChar = false;
      }
    },
    handleClick(event) {
      const { sLoading } = this.$data;
      if (sLoading) {
        return;
      }
      this.$emit('click', event);
    },
    insertSpace(child, needInserted) {
      const SPACE = needInserted ? ' ' : '';
      if (typeof child.text === 'string') {
        // 去除button内容的前后空格
        let text = child.text.trim();
        // 判断是两个汉字则插入空格
        if (isTwoCNChar(text)) {
          text = text.split('').join(SPACE);
        }
        return <span>{text}</span>;
      }
      return child;
    },
    isNeedInserted() {
      // button只有一个子元素 & prop icon 为空（按钮内容无icon）则需要插入空格
      const { $slots, type } = this;
      const icon = getComponentFromProp(this, 'icon');
      return $slots.default && $slots.default.length === 1 && !icon && type !== 'link';
    },
  },
  render() {
    const { type, htmlType, classes, disabled, handleClick, sLoading, $slots, $attrs } = this;
    const icon = getComponentFromProp(this, 'icon');
    const buttonProps = {
      attrs: {
        ...$attrs,
        disabled,
      },
      class: classes,
      on: {
        ...getListeners(this),
        click: handleClick,
      },
    };
    // 获取iconType
    const iconType = sLoading ? 'loading' : icon;
    // 获取iconNode
    const iconNode = iconType ? <Icon type={iconType} /> : null;
    const children = filterEmpty($slots.default);
    const autoInsertSpace = this.configProvider.autoInsertSpaceInButton !== false;
    const kids = children.map(child =>
      this.insertSpace(child, this.isNeedInserted() && autoInsertSpace),
    );

    // href属性不为空则渲染<a></a>
    if ($attrs.href !== undefined) {
      return (
        <a {...buttonProps} ref="buttonNode">
          {iconNode}
          {kids}
        </a>
      );
    }

    const buttonNode = (
      <button {...buttonProps} ref="buttonNode" type={htmlType || 'button'}>
        {iconNode}
        {kids}
      </button>
    );

    // 如果button type 为link，直接返回 buttonNode
    if (type === 'link') {
      return buttonNode;
    }

    return <Wave>{buttonNode}</Wave>;
  },
};
