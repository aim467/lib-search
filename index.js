#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const clipboardy = require('clipboardy');

const inquirer = require('inquirer');

program
  .version('1.0.0')
  .description('多语言依赖搜索工具');

program
  .command('java')
  .description('搜索Java项目的Maven依赖')
  .option('-q, --query <query>', '搜索关键字 -q 不能和 -a -g -v 共用')
  .option('-a, --artifact <artifact>', '搜索特定的 artifact')
  .option('-g, --groupId <groupId>', '搜索特定的 groupId')
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

    if (options.query) {
      const query = encodeURIComponent(options.query);
      const url = `${baseUrl}q=${query}&start=${start}&rows=${resultsPerPage}&wt=json`;
      const response = await axios.get(url);
      const { data } = response;
      const { response: { docs, numFound } } = data;
      if (docs.length < 0) {
        return;
      }
      console.log(`搜索结果 (${start + 1}-${start + docs.length}/${numFound})：`);
      let result = []
      docs.forEach(element => {
        let dependecy = `${element.g}:${element.a}:${element.latestVersion}`
        result.push(dependecy);
      });
      console.log(result);
      return;
    }
  } catch (error) {
    console.error('搜索过程中出现错误：', error.message);
  }
}
