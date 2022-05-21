# webpack 性能优化
* 开发环境性能优化
* 生成环境性能优化


## 开发环境性能优化
* 优化打包构建速度
* 优化代码调试


## 生产环境性能优化
* 优化打包构建速度
* 优化代码运行的性能 


# 开发环境优化
## HMR: 热替换模块
- css文件：可以使用HMR功能。
- js文件：默认不能使用HMR功能。
- html文件：默认不能使用HMR功能；同时会导致html文件不能热更新了。解决：修改entry入口，将html文件引入。不需要做HMR功能。
- HMR基于devServer的开发环境无需devServer，所以HMR只用于生产环境

## source-map:一种提供源代码到构建后代码映射技术（如果构建后代码出错了，通过映射可以追踪源代码）
- [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map

- inline-source-map: 内联 只生成一个内联source-map；错误代码准确信息和源代码错误位置
- hidden-source-map: 外部 在外部生成一个source-map 文件；错误代码准确信息，但没有错误位置
- eval-source-map: 内联 每一个文件都生成对应的source-map文件；错误代码准确信息和源代码错误位置

- nosources-source-map: 外部 在外部生成一个source-map 文件；错误代码准确信息，但是没有任何源代码信息
- cheap-source-map: 外部 在外部生成一个source-map 文件；错误代码准确信息和源代码错误位置，但是只能精确到行
- cheap-module-source-map: 外部 在外部生成一个source-map 文件；错误代码准确信息和源代码的错误位置，module会将loader的cource map加入

### 内联和外部的区别：
1. 外部生成了文件，内联没有
2. 内联构建速度更快

### 调试最友好：eval-souce-map
### 性能最友好：cheap-module-souce-map

### 生产环境 souce-map
### 开发环境 eval-souce-map

# 生产环境优化

## oneOf 
- 注意：不能有两个配置处理同一个文件
- 优化了打包构建速度

## 开启babel缓存
- cacheDirectory: true
- 第二次构建，会读取之前的缓存，用于打包构建优化

## 文件资源缓存(需要后端配置)

### hash
- 每次webpack构建都会生成一个唯一的hash值
- 问题：因为js/css同时使用一个hash值；如果重新打包，会导致所有缓存失效

### chunkhash
- 根据chunk生成hash值。如果打包来源于同一个chunk，那么hash值就一样
- 问题：js和css的hash值还是一样的；因为css是在js中被引入的，所以同属于一个chunk

### contenthash
- 根据文件的内容生成hash值。不同文件hash值一定不一样
- 优点：让代码上线运行缓存更好使用，用于线上运行速度

## tree shaking 去除无用代码
- 前提：1.必须使用ES6模块化 2.开启production环境
- 在package.json中配置 "sideEffects": ["*.css"]
- [] 中是配置排除的文件后缀，否则像.css等会被当做副作用文件给去除

## code split 代码分割
### entry 设置多入口
### optimization: {splitChunks: {chunks: 'all'}}
- 单入口时：可以将 第三方代码 单独打包一个chunk输出。
- 多入口时: 自动分析多入口chunk中，有没有公共的文件。如果有会打包成单独一个chunk。

## PWA：渐进式网络开发应用程序（离线可访问）
- 安装 npm i workbox-webpack-plugin -D

    
