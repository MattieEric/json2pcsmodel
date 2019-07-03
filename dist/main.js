#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var fs = require("fs-extra");
var program = require("commander");
var inquirer = require("inquirer");
var chalk_1 = require("chalk");
var GeneratorModel_1 = require("./ModelGenerator/GeneratorModel");
var path = require("path");
program
    .description('一款由json自动生成Picasso安全model文件的公具')
    .option('-i, --inputFilePath [inputFilePath]', 'json文件路径')
    .option('-o, --outputFilePath [outputFilePath]', '生成model文件路径')
    .option('-r, --rootClassName [rootClassName]', 'model根数据结构名称')
    .option('-d, --duplicate [duplicate]', '是否允许同名数据结构存在(allow：允许；disallow：不允许), 默认为disallow')
    .action(function (option) { return __awaiter(_this, void 0, void 0, function () {
    var inputFilePath, outputFilePath, rootClassName, duplicate, answer, object, isDefaultOutputFilePath, messasge, answer, coverAction, pos, fileName, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                inputFilePath = option.inputFilePath, outputFilePath = option.outputFilePath, rootClassName = option.rootClassName, duplicate = option.duplicate;
                inputFilePath = (inputFilePath || '').trim();
                outputFilePath = (outputFilePath || '').trim();
                rootClassName = (rootClassName || '').trim();
                duplicate = (duplicate || '').trim();
                console.log(chalk_1["default"].greenBright('校验参数中...'));
                if (!(inputFilePath.length == 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, inquirer.prompt([{
                            type: 'input',
                            name: 'inputFilePath',
                            message: '请输入目标json文件路径',
                            validate: function (input) {
                                if (!input || !isValidFilePath(getFullFilePath(input))) {
                                    return '输入目标json路径不合理';
                                }
                                return true;
                            }
                        }])];
            case 1:
                answer = _a.sent();
                inputFilePath = (answer.inputFilePath || '').trim();
                _a.label = 2;
            case 2:
                // 校验输入json路径是否正确
                if (inputFilePath.length > 0 && !isValidFilePath(getFullFilePath(inputFilePath))) {
                    console.log(chalk_1["default"].yellowBright('❌ 指定json文件路径无效，请确定正确的目标json文件路径，并重新执行命令'));
                    return [2 /*return*/];
                }
                console.log(chalk_1["default"].greenBright('✅ 输入json文件路径有效'));
                object = null;
                try {
                    object = fs.readJSONSync(inputFilePath);
                }
                catch (error) {
                    console.log(chalk_1["default"].yellowBright('❌ 指定文件中的JSON数据无效，请检查JSON文件，并重新执行命令'));
                    return [2 /*return*/];
                }
                if (object) {
                    console.log(chalk_1["default"].greenBright('✅ 指定文件中的JSON数据有效'));
                }
                else {
                    console.log(chalk_1["default"].yellowBright('❌ 指定文件中的JSON数据无效，请检查JSON文件，并重新执行命令'));
                    return [2 /*return*/];
                }
                isDefaultOutputFilePath = true;
                if (outputFilePath.length > 0) {
                    isDefaultOutputFilePath = false;
                    // 校验指定的输出路径是否正确
                    outputFilePath = getFullFilePath(outputFilePath);
                    if (!isValidDir(outputFilePath)) {
                        console.log(chalk_1["default"].yellowBright('❌ 指定输出文件路径无效，请确定正确的输出文件路径，并重新执行命令'));
                        return [2 /*return*/];
                    }
                }
                else {
                    outputFilePath = path.join(process.cwd(), './Model.ts');
                    console.log(chalk_1["default"].greenBright('✅ 未指定输出文件目录，生成Model将默认输出到当前目录的Model.ts文件中'));
                }
                if (!isValidFilePath(outputFilePath)) return [3 /*break*/, 4];
                messasge = '指定输出文件已存在，是否覆盖？';
                if (isDefaultOutputFilePath) {
                    messasge = '默认输出路径下已存在名为Model.ts的文件，是否进行覆盖？';
                }
                return [4 /*yield*/, inquirer.prompt([{
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
                        }])];
            case 3:
                answer = _a.sent();
                coverAction = answer.coverAction;
                switch (coverAction) {
                    case 'cover':
                        fs.removeSync(outputFilePath);
                        console.log(chalk_1["default"].greenBright('✅ 移除原文件'));
                        break;
                    case 'newfile':
                        outputFilePath = getANonexistentFilePath(outputFilePath);
                        pos = outputFilePath.lastIndexOf('/');
                        fileName = outputFilePath.substring(pos + 1, outputFilePath.length);
                        console.log(chalk_1["default"].greenBright('✅ 生成新文件，文件名为：' + fileName));
                        break;
                    case 'exit':
                        console.log(chalk_1["default"].yellowBright('⏹  您终结了进程'));
                        return [2 /*return*/];
                }
                return [3 /*break*/, 5];
            case 4:
                if (!isDefaultOutputFilePath) {
                    console.log(chalk_1["default"].greenBright('✅ 指定输出文件路径有效'));
                }
                _a.label = 5;
            case 5:
                // 校验根类名
                if (rootClassName.length == 0) {
                    rootClassName = 'RootClass';
                    console.log(chalk_1["default"].greenBright('✅ 未指定根Model类名，默认使用RootClase'));
                }
                else {
                    console.log(chalk_1["default"].greenBright('✅ 指定根Model类名为' + rootClassName));
                }
                // 校验同类名Model生成策略
                if (duplicate.length == 0) {
                    duplicate = 'disallow';
                    console.log(chalk_1["default"].greenBright('⚠️  未指定是否允许同名model存在，默认为不允许，同名Model将只会保留第一个'));
                }
                else {
                    message = '';
                    if (duplicate == 'allow') {
                        message = '⚠️  指定允许存在同名Model，假如生成Model有同名Model，需手动进行修改';
                    }
                    else {
                        message = '⚠️  指定不允许存在同名Model，同名Model将只会保留第一个';
                    }
                    console.log(chalk_1["default"].greenBright(message));
                }
                console.log(chalk_1["default"].greenBright('开始生成model...'));
                generateModel(object, outputFilePath, rootClassName, duplicate);
                return [2 /*return*/];
        }
    });
}); });
program.parse(process.argv);
function generateModel(jsonData, outputFilePath, rootClassName, duplicate) {
    var gen = new GeneratorModel_1["default"]();
    var modelInfo = gen.generateModel({
        jsonData: jsonData,
        rootClassName: rootClassName,
        duplicate: duplicate
    });
    var model = modelInfo.model, duplicateClasses = modelInfo.duplicateClasses;
    if (model && model.length > 0) {
        fs.writeFileSync(outputFilePath, model);
        console.log(chalk_1["default"].greenBright('✅ 成功生成model，路径为：' + outputFilePath));
    }
    if (duplicateClasses.length > 0) {
        console.log(chalk_1["default"].greenBright('⚠️  检测到同名model:' + duplicateClasses.join('、')));
    }
}
/**
 * 获取完整路径
 * @param filePath
 */
function getFullFilePath(filePath) {
    if (path.isAbsolute(filePath)) {
        return filePath;
    }
    return path.join(process.cwd(), filePath);
}
/**
 * 校验文件路径是否存在
 * @param filePath
 */
function isValidDir(filePath) {
    var pos = filePath.lastIndexOf('/');
    var dir = filePath.substring(0, pos + 1);
    return fs.pathExistsSync(dir);
}
/**
 * 校验文件是否存在
 * @param filePath
 */
function isValidFilePath(filePath) {
    return fs.existsSync(filePath);
}
function getANonexistentFilePath(filePath) {
    var pos = filePath.lastIndexOf('/');
    var dotPos = filePath.lastIndexOf('.');
    var dir = filePath.substring(0, pos + 1);
    if (dotPos == -1) {
        dotPos = filePath.length;
    }
    var fileName = filePath.substring(pos + 1, dotPos);
    fileName = fileName + '_new';
    var number = 1;
    while (isValidFilePath(dir + fileName + number + '.ts')) {
        number++;
    }
    return dir + fileName + number + '.ts';
}
