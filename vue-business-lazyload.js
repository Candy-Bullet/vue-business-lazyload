/**
 * 懒加载原理：
 * 一开始不给src添加值 这样渲染的时候不加载图片
 * 判断图片是否在可视区域 根据滚动事件判断 记得节流
 * 是的话通过new Image()请求图片 核心
 * 再设置setAttribute
 */

const loadImageAsync = (src, resolve, reject) => {
    let image = new Image();
    image.src = src;
    image.onload = resolve;
    image.onerror = reject
}
const throttle = (cb, delay) => {
    let prev = Date.now();
    return () => {
        let now = Date.now();
        if (now - prev >= delay) {
            cb();
            prev = Date.now();
        }
    }
}



const Lazy = (Vue) => {
    /**
     * 每个图片对应ReactiveListener实例
     */
    class ReactiveListener {
        constructor({ el, src, elRenderer, options }) {
            this.el = el;
            this.src = src;
            this.elRenderer = elRenderer;
            this.options = options;
            // 定义状态
            this.state = { loading: false }
        }
        /**
         * 检测是否位于可视区域
         */
        checkInView() {
            let { top } = this.el.getBoundingClientRect();
            return top < window.innerHeight * this.options.preLoad
        }
        /**
         * 异步加载图片
         */
        load() {
            this.elRenderer(this, 'loading');
            loadImageAsync(this.src, () => {
                this.state.loading = true; // 加载完毕了
                this.elRenderer(this, 'loaded');
            }, () => {
                this.elRenderer(this, 'error');
            });
        }
    }
    return class LazyClass {
        constructor(options) {
            this.options = options;
            this.listenerQueue = [];
            /**
             * 加锁只注册一次事件
             */
            this.bindHandler = false;
        }
        lazyLoadHandler() {
            /**
             * 判断是否要显示哪些图片
             */
            this.listenerQueue.forEach((listener) => {
                /**
                 * 没有加载过图片的才执行这个方法
                 */
                if (!listener.state.loading) {
                    let catIn = listener.checkInView()
                    catIn && listener.load()
                }
            })
        }
        /**
         * 意思没使用一个v-lazy指令
         * 就会调用这个指令
         */
        add(el, bindings, vnode) {
            Vue.nextTick(() => {
                // 获取滚动元素
                let parent = scrollParent(el);
                // 获取链接
                let src = bindings.value;
                // 绑定事件
                if (!this.bindHandler) {
                    this.bindHandler = true;
                    /**
                     * 节流
                     */
                    this.lazyHandler = throttle(this.lazyLoadHandler.bind(this), 500);
                    parent.addEventListener('scroll', this.lazyHandler.bind(this));
                }
                // 给每个元素创建个实例，放到数组中
                const listener = new ReactiveListener({
                    el, // 当前元素
                    src, // 真实路径
                    elRenderer: this.elRenderer.bind(this), // 传入渲染器
                    options: this.options
                });
                this.listenerQueue.push(listener);
                // 检测需要默认加载哪些数据
                this.lazyLoadHandler();
            });
        }
        /**
         * 添加img 属性节点
         */
        elRenderer(listener, state) {
            let el = listener.el;
            let src = '';
            switch (state) {
                case 'loading':
                    src = listener.options.loading || ''
                    break;
                case 'error':
                    src = listener.options.error || ''
                default:
                    src = listener.src;
                    break;
            }
            el.setAttribute('src', src)
        }
    }
}
export default const VueLazyload = {
    install(Vue) {
        const LazyClass = Lazy(Vue);
        const lazy = new LazyClass(options);
        Vue.directive('lazy', {
            /**
             * 只调用一次，指令第一次绑定到元素时调用
             * 但是此事拿不到父节点
             * 可用nextTick去拿到
             */
            bind: lazy.add.bind(lazy)
        });
    }
}