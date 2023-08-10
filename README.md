# `lib-search` 基于命令行的多语言依赖搜索工具

## 安装

安装需要依赖 [`nodejs`](https://nodejs.org/en) ，请自行安装。

克隆此项目，然后安装依赖。

```shell
npm install
```

把项目安装到可执行目录。

```shell
npm install -g
```

## 使用

查询某个特定关键字的依赖列表

```shell
lib-search java -q spring-boot-starter-web
```

查询某个特定关键字的依赖列表并且分页

```shell
lib-search java -q spring-boot-starter-web -p 1 -r 20
```

查询特定的 groupId 或 artifactId 的依赖

```shell
lib-search java -a pagehelper-spring-boot-starter
```

查询后的结果支持上下选择依赖，并且使用回车复制到剪切板。