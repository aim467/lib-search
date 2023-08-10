#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const clipboardy = require('clipboardy');
const chalk = require('chalk');
const inquirer = require('inquirer');

program
  .version('1.0.0')
  .description('多语言依赖搜索工具');

program
  .command('java')
  .description('搜索Java项目的Maven依赖')
  .option('-q, --query <query>', '搜索关键字 -q 不能和 -a -g -v 共用')
  .option('-a, --artifactId <artifactId>', '搜索特定的 artifactId')
  .option('-g, --groupId <groupId>', '搜索特定的 groupId')
  .option('-v, --version <version>', '搜索特定的版本号')
  .option('-p, --page <page>', '页码', 1)
  .option('-r, --results <results>', '每页结果数', 10)
  .action(searchJavaDependencies);

program.parse(process.argv);

async function searchJavaDependencies(options) {
  try {
    let baseUrl = "https://search.maven.org/solrsearch/select?";
    const page = options.page;
    const resultsPerPage = options.results;
    const start = (page - 1) * resultsPerPage;

    let query = '';

    if (options.query) {
      query = encodeURIComponent(options.query);
    } else if (options.artifactId || options.groupId || options.version) {
      if (options.artifactId) {
        query += `a:${encodeURIComponent(options.artifactId)} `;
      }
      if (options.groupId) {
        query += `g:${encodeURIComponent(options.groupId)} `;
      }
      if (options.version) {
        query += `v:${encodeURIComponent(options.version)} `;
      }
      query = query.trim();
    }

    const url = `${baseUrl}q=${query}&start=${start}&rows=${resultsPerPage}&wt=json`;
    const response = await axios.get(url);
    const { data } = response;
    const { response: { docs, numFound } } = data;
    
    if (docs.length < 1) {
      console.log(chalk.yellow('没有找到匹配的依赖。'));
      return;
    }

    const choices = docs.map(element => ({
      name: `${element.g}:${element.a}:${element.latestVersion}`,
      value: {
        groupId: element.g,
        artifactId: element.a,
        version: element.latestVersion
      },
    }));

    const prompt = inquirer.createPromptModule();
    const selected = await prompt([
      {
        type: 'list',
        name: 'dependency',
        message: chalk.green(`找到 ${numFound} 个匹配的依赖。请选择一个依赖：`),
        choices,
      }
    ]);

    const { groupId, artifactId, version } = selected.dependency;
    clipboardy.writeSync(`<dependency>\n  <groupId>${groupId}</groupId>\n  <artifactId>${artifactId}</artifactId>\n  <version>${version}</version>\n</dependency>`);
    console.log(chalk.green(`已将依赖 ${selected.dependency.groupId}:${selected.dependency.artifactId}:${selected.dependency.version} 复制到剪贴板。`));
  } catch (error) {
    console.error(chalk.red('搜索过程中出现错误：', error.message));
  }
}
