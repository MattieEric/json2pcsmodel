#! /usr/bin/env node

import * as fs from 'fs-extra'
import program = require('commander');
import inquirer = require('inquirer');
import chalk from 'chalk';
import Generator from './ModelGenerator/GeneratorModel'
import path = require('path')

program
    .description('一款由json自动生成TS安全model文件的工具')
    .option('-i, --inputFilePath [inputFilePath]', 'json文件路径')
    .option('-o, --outputFilePath [outputFilePath]', '生成model文件路径')
    .option('-r, --rootClassName [rootClassName]', 'model根数据结构名称')
    .option('-d, --duplicate [duplicate]', '是否允许同名数据结构存在(allow：允许；disallow：不允许), 默认为disallow')
    .action(async (option: any) => {
        let { inputFilePath, outputFilePath, rootClassName, duplicate } = option
        inputFilePath = (inputFilePath || '').trim()
        outputFilePath = (outputFilePath || '').trim()
        rootClassName = (rootClassName || '').trim()
        duplicate = (duplicate || '').trim()

        console.log(chalk.greenBright('校验参数中...'))

        if (inputFilePath.length == 0) {
            const answer: any = await inquirer.prompt([{
                type: 'input',
                name: 'inputFilePath',
                message: '请输入目标json文件路径',
                validate: function (input) {
                    if (!input || !isValidFilePath(getFullFilePath(input))) {
                        return '输入目标json路径不合理'
                    }
                    return true
                }
            }])
            inputFilePath = (answer.inputFilePath || '').trim()
        }

        // 校验输入json路径是否正确
        if (inputFilePath.length > 0 && !isValidFilePath(getFullFilePath(inputFilePath))) {
            console.log(chalk.yellowBright('❌ 指定json文件路径无效，请确定正确的目标json文件路径，并重新执行命令'))
            return
        }
        console.log(chalk.greenBright('✅ 输入json文件路径有效'))

        let object = null
        try {
            object = fs.readJSONSync(inputFilePath)
        } catch (error) {
            console.log(chalk.yellowBright('❌ 指定文件中的JSON数据无效，请检查JSON文件，并重新执行命令'))
            return
        }
        if (object) {
            console.log(chalk.greenBright('✅ 指定文件中的JSON数据有效'))
        } else {
            console.log(chalk.yellowBright('❌ 指定文件中的JSON数据无效，请检查JSON文件，并重新执行命令'))
            return
        }

        let isDefaultOutputFilePath = true
        if (outputFilePath.length > 0) {
            isDefaultOutputFilePath = false
            // 校验指定的输出路径是否正确
            outputFilePath = getFullFilePath(outputFilePath)
            if (!isValidDir(outputFilePath)) {
                console.log(chalk.yellowBright('❌ 指定输出文件路径无效，请确定正确的输出文件路径，并重新执行命令'))
                return
            }
        } else {
            outputFilePath = path.join(process.cwd(), './Model.ts')
            console.log(chalk.greenBright('✅ 未指定输出文件目录，生成Model将默认输出到当前目录的Model.ts文件中'))
        }

        // 校验指定输出路径下是否存在同名文件
        if (isValidFilePath(outputFilePath)) {
            let messasge = '指定输出文件已存在，是否覆盖？'
            if (isDefaultOutputFilePath) {
                messasge = '默认输出路径下已存在名为Model.ts的文件，是否进行覆盖？'
            }
            const answer: any = await inquirer.prompt([{
                type: 'list',
                name: 'coverAction',
                message: messasge,
                choices: [
                    {
                        name: 'cover',
                        value: 'cover'
                    },
                    {
                        name: 'do not cover, and add a new file',
                        value: 'newfile'
                    },
                    {
                        name: 'do not cover, and exit',
                        value: 'exit'
                    }
                ]
            }])
            let { coverAction } = answer
            switch (coverAction) {
                case 'cover':
                    fs.removeSync(outputFilePath)
                    console.log(chalk.greenBright('✅ 移除原文件'))
                    break
                case 'newfile':
                    outputFilePath = getANonexistentFilePath(outputFilePath)
                    const pos = outputFilePath.lastIndexOf('/')
                    const fileName = outputFilePath.substring(pos + 1, outputFilePath.length)
                    console.log(chalk.greenBright('✅ 生成新文件，文件名为：' + fileName))
                    break
                case 'exit':
                    console.log(chalk.yellowBright('⏹  您终结了进程'))
                    return
            }
        } else {
            if (!isDefaultOutputFilePath) {
                console.log(chalk.greenBright('✅ 指定输出文件路径有效'))
            }
        }

        // 校验根类名
        if (rootClassName.length == 0) {
            rootClassName = 'RootClass'
            console.log(chalk.greenBright('✅ 未指定根Model类名，默认使用RootClase'))
        } else {
            console.log(chalk.greenBright('✅ 指定根Model类名为' + rootClassName))
        }

        // 校验同类名Model生成策略
        if (duplicate.length == 0) {
            duplicate = 'disallow'
            console.log(chalk.greenBright('⚠️  未指定是否允许同名model存在，默认为不允许，同名Model将只会保留第一个'))
        } else {
            let message = ''
            if (duplicate == 'allow') {
                message = '⚠️  指定允许存在同名Model，假如生成Model有同名Model，需手动进行修改'
            } else {
                message = '⚠️  指定不允许存在同名Model，同名Model将只会保留第一个'
            }
            console.log(chalk.greenBright(message))
        }

        console.log(chalk.greenBright('开始生成model...'))
        generateModel(object, outputFilePath, rootClassName, duplicate)
    })

program.parse(process.argv)

function generateModel(jsonData: object, outputFilePath: string, rootClassName: string, duplicate: string) {
    const gen = new Generator()
    const modelInfo = gen.generateModel({
        jsonData: jsonData,
        rootClassName: rootClassName,
        duplicate: duplicate
    })
    const { model, duplicateClasses } = modelInfo
    if (model && model.length > 0) {
        fs.writeFileSync(outputFilePath, model)
        console.log(chalk.greenBright('✅ 成功生成model，路径为：' + outputFilePath))
    }
    if (duplicateClasses.length > 0) {
        console.log(chalk.greenBright('⚠️  检测到同名model:' + (<string[]>duplicateClasses).join('、')))
    }
}


/**
 * 获取完整路径
 * @param filePath 
 */
function getFullFilePath(filePath: string) {
    if (path.isAbsolute(filePath)) {
        return filePath
    }
    return path.join(process.cwd(), filePath)
}

/**
 * 校验文件路径是否存在
 * @param filePath 
 */
function isValidDir(filePath: string) {
    const pos = filePath.lastIndexOf('/')
    const dir = filePath.substring(0, pos + 1)
    return fs.pathExistsSync(dir)
}

/**
 * 校验文件是否存在
 * @param filePath 
 */
function isValidFilePath(filePath: string) {
    return fs.existsSync(filePath)
}

function getANonexistentFilePath(filePath: string) {
    const pos = filePath.lastIndexOf('/')
    let dotPos = filePath.lastIndexOf('.')
    const dir = filePath.substring(0, pos + 1)
    if (dotPos == -1) {
        dotPos = filePath.length
    }
    let fileName = filePath.substring(pos + 1, dotPos)
    fileName = fileName + '_new'
    let number = 1
    while (isValidFilePath(dir + fileName + number + '.ts')) {
        number++
    }
    return dir + fileName + number + '.ts'
}