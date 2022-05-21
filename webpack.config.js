/**
 * npm init -y 初始化
 * 
 * npm i webpack webpack-cli -g  先安装全局环境
 * 
 * npm i webpack webpack-cli -D  再安装本地环境
 * 
 **/

const { resolve } = require ("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerWebpackplugin = require('css-minimizer-webpack-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

// 设置  nodejs 的环境变量
// browserslist 默认走 pro， 需要走 dev，则要如下设置
process.env.NODE_ENV = "development";

// 复用 css loader
const commonCssLoader = [
                    // 创建 style 标签， 将js中的样式资源插入进行， 添加到head中生效
                    // 安装 npm i style-loader -D
                    // 'style-loader',

                    // 提取js中的css成单独文件
                    // 安装 npm i mini-css-extract-plugin -D
                    MiniCssExtractPlugin.loader,
                    // 将 css 文件变成 commonjs 模块加载js中， 里面内容是样式字符串
                    // 安装 npm i css-loader -D
                    'css-loader',

                    /** 
                     *  css 兼容行处理
                     *  安装 npm i postcss-loader postcss-preset-env -D
                     *  postcss-preset-env：帮postcss找到package.json中的browserslist里面的配置，通过配置加载指定的css兼容性样式
                     *  需要在 package.json 中配置 browserslist
                     * 
                     * "browserslist": {
                     * "development": [
                     *   "last 1 chrome version",
                     *   "last 1 firefox version",
                     *   "last 1 safari version"
                     * ],
                     * "production": [
                     *    ">0.2%",
                     *    "not dead",
                     *    "not op_mini all"
                     *  ] 
                     * }
                     * 更多的配置可以去 github 搜索 browserslist 学习更多的配置
                     * 
                     * 
                     **/

                    // 使用 loader默认配置
                    // 'postcss-loader',

                    // 修改loader的配置
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                require('postcss-preset-env')()
                            ]
                        }
                    }   
                ]

module.exports = {
    // 入口起点 单入口  用于单页面应用
    entry: ['./src/index.js', './src/html.html'],

    // 多入口  用于多页面应用
    // entry: {
    //     main: './src/js/index.js',
    //     test: './src/js/test.js'
    // },

    // 打包到哪里
    output: {

        // 输出的文件名
        // [name] 获取文件名
        filename: 'js/[name].[contenthash:10].js',
        // 输出的路径
        path: resolve(__dirname, ''),
        // 所有资源引入公共路径前缀
        publicPath: '/',
        // 非入口chunk名称
        chunkFilename: 'js/[name]_chunk.js'

    },

    // loader 配置
    module: {
        rules: [
            {
                // 语法检查
                // 安装 npm i eslint-loader eslint -D
                // 注意：只检查自己写的代码，第三方库无需检查，请需排除
                /**
                 * 设置检查规则
                 * airbnb 风格
                 * 安装 npm i eslint-config-airbnb-base eslint-plugin-import -D
                 * 并在 package.json 中 配置 eslintConfig
                 * "eslintConfig": {
                        "extends": "airbnb-base"
                    }
                */
                test: /\.js$/,
                exclude: /node_modules/,
                // 优先执行
                enforce: 'pre',
                loader: 'eslint-loader',
                options: {
                    // 自动修复错误  
                    fix: true
                }
            },
            {
                // oneOf 每次只匹配一个loader，优化打包构建速度
                // 注意：不能有两个配置处理同一个类型文件
                oneOf: [
                    // 处理css
                    {
                        // 匹配 .css 文件
                        // css -> style
                        test: /\.css$/,
                        // 使用哪些loader进行处理
                        // use 执行顺序： 从右到左 依次执行
                        use: [...commonCssLoader]
                    },
                    {
                        // 匹配 .less 文件
                        // less -> css -> style
                        test: /\.less$/,
                        use: [
                            ...commonCssLoader,
                            // 将less文件编译成 css 文件
                            // 安装 npm i less less-loader -D
                            'less-loader'
                        ]
                    },
                    // 处理图片
                    {
                        // 配置 图片
                        test: /\.(jpg|png|gif)$/,
                        // 使用一个用 loader: '' , 使用多个用 use: []
                        // 安装 npm i url-loader file-loader -D
                        loader: 'url-loader',
                        options: {
                            // 图片大小小于8kb， 就会被base64处理
                            // 有点：减少请求量（减轻服务器压力）
                            // 缺点： 图片体积会变大
                            limit: 8 * 1024,
                            // 需要关闭 url-loader 的es6模块化，使用 commonjs 解析
                            esModule: false,
                            // 给图片重命名
                            // hash:10  名字hash取10位
                            // ext 取文件原来的扩展名
                            name: '[hash: 10].[ext]',
                            // 这类文件输出到指定目录下
                            entryPath: ''
                        }
                    },
                    {   
                        // 处理 html 文件中 img标签 引入的的图片
                        // 安装 npm i html-loader -D
                        test: /\.html$/,
                        loader: 'html-loader'
                    }, 
                    // 处理其他资源
                    {
                        // 打包其它资源 除css/js/html/图片
                        // 安装 npm i file-loader -D
                        // exclude 排除 ** 之外
                        exclude: /\.(html|js|css|png|jpg|gif)$/,
                        loader: 'file-loader',
                        options: {
                            name: '[hash: 10].[ext]'
                        }
                    },
                    // 处理js
                    {
                        // js 兼容性处理
                        // 安装 npm i babel-loader  @babel/core -D
                        // 1.安装 npm i @babel/preset-env -D 基本js兼容处理，像 promise 无法处理
                        // 2.安装 npm i @babel/polyfill -D  全部js兼容处理，但会增大代码体积，不推荐
                        // 3.安装 npm i core-js -D  按需加载
                        // 推荐 1+2 的方式处理js兼容性
                        test: /\.js$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                {
                                    useBuiltIns: 'usage',
                                    // 指定 core-js 版本
                                    corejs: {
                                        version: 3
                                    },
                                    // 指定兼容性做到哪个版本浏览器
                                    targets: {
                                        chrome: '60',
                                        firefox: '60',
                                        ie: '9',
                                        safari: '10',
                                        edge: '17'
                                    }
                                }
                            ],
                            // 开启babel缓存
                            // 第二次构建，会读取之前的缓存
                            cacheDirectory: true
                        }
                    }
                ]
            }
        ]
    },  

    // plugins 配置
    plugins: [
        // 处理 html
        // html-webpack-plugin 配置 html
        // 安装 npm i html-webpack-plugin -D
        // 需要引用 const HtmlWebpackPlugin = require('html-webpack-plugin')
        // 功能： 默认会创建一个空的 Html 文件，自动引入打包输出的所有资源（js/css）
        // 需求： 需要有结构的 Html 文件
        new HtmlWebpackPlugin({
            // 复制  目标 文件，并自动引入打包输出的所有资源（js/css）
            template: '',
            minify: {
                // 移除空格
                collapseWhitespace: true,
                // 移除注释
                removeComments: true,
            }
        }),
        // 处理css
        new MiniCssExtractPlugin({
            // 指定输出的路径  并对css文件重命名
            filename: ''
        }),
        // 压缩 css
        // webpack 5+ 安装 npm i css-minimizer-webpack-plugin -D
        // webpack 4+ 安装 npm i optimize-css-assets-webpack-plugin
        new CssMinimizerWebpackplugin(),
        
        //渐进式网络开发应用程序（离线可访问）
        // 帮助serviceworker快速启动
        // 删除旧的 serviceworker
        // 生成一个 serviceworker 配置文件
        new WorkboxWebpackPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        }),
        
    ],

    // 单入口时：可以将 第三方代码 单独打包一个chunk输出
    // 多入口时: 自动分析多入口chunk中，有没有公共的文件。如果有会打包成单独一个chunk
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all'
    //     }
    // },

    // 模式
    mode: 'development' ,

    // 解析模块的规则
    resolve: {
        // 配置解析模块路径别名：有点简写路径
        alias: {
            $css: resolve(__dirname, 'src/css')
        },
        // 配置省略文件路径的后缀名
        extensions: ['.js','.json','.jsx','.css'],
        // 告诉webpack解析模块是去找哪个目录
        modules: [resolve(__dirname, '../../node_modules'), 'node_modules']
    },


    // 开发服务器 devserver
    // 自动化编译，打开编辑器，刷新网页
    // 特点： 只会在内存中编译打包，不会有任何输出
    // 启动指令：npx webpack-dev-server
    // 安装 npm i webpack-dev-server -D
    devServer: {
        // 自动打包路径
        contentBase: resolve(__dirname, 'build'),
        // 启动gzip压缩
        compress: true,
        // 端口号
        port: 3000,
        // 自动打开默认浏览器
        open: true,
        //HMR: 热替换模块
        // hot: true
        // 监视 contentBase 目录下的所有文件，一旦发生变化就会重新打包
        watchConontentBase: true,
        watchOptions: {
            // 忽略文件
            ignored: true
        },
        //不要显示启动服务器日志信息
        clientLogLevel: 'none',
        // 除了一些基本启动信息意外，其他内容都不要显示
        quiet: true,
        // 如果出错不要全屏提示
        overlay: true,
        // 服务器代理，解决开发环境跨域问题
        proxy: {
            '/api': {
                target: 'http://localhost:3000'
            },
            // 发送请求时吗，请求路径重写：将/api/xxx --> /xxx (去掉/api)
            pathRewrite: {
                '^/api': ''
            }
        }
    },
    // 开启 source-map
    // 调试最友好方案 souce-map
    // 性能最友好方案 cheap-module-souce-map
    // 生产环境 souce-map
    // 开发环境 eval-souce-map
    devltool: 'souce-map',

    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 30 * 1024, // 分割的chunk最小为30kb
            maxSize: 0, // 没有最大限制
            minChunks: 1, // 要提取的chunk最少被引用1次
            maxAsyncRequests: 5, // 按需加载时并行加载的文件的最大数量
            maxInitialRequests: 3, //入口js文件最大并行请求数量
            automaticNameDelimiter: '', //名称连接符
            name: true, //可以使用命名规则
            cacheGroups: {
                // 分割chunk的组
                // node_modules文件会被打包 vendors 组的chunk中 ---> vendorsxxx.js
                // 满足上面的公共规则，如： 大小超过30kb，至少引用一次
                test: /[\\/]node_modules[\\/]/,
                // 优先级
                priority: -10
            },
            default: {
                // 要提取的chunk最少被引用2次
                minChunks: 2,
                // 优先级
                priority: -20,
                // 如果当前要打包的模块，和之前已经被提取的模块是同一个，就会复用，而不是重新打包模块
                resuseExistingChunk: true
            }
        },
        // 将当前模块的记录其他模块的hash当都打包为一个文件 runtime
        // 解决：修改a文件导致b文件的contenthash变化
        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}`
        },
        // 配置生成生产环境的压缩方案： js和css
        // 安装 npm i terser-webpack-plugin -D
        minimizer: [
            new TerserWebpackPlugin({
                // 开启缓存
                cache: true,
                //开启多进程打包
                parallel: true,
                // 启动source-map
                sourceMap: true
            })
        ]
    }


}