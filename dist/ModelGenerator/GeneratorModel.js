"use strict";
exports.__esModule = true;
var Generator = /** @class */ (function () {
    function Generator() {
        this.model = '';
        this.objectStack = [];
        this.moduleMap = new Set();
        this.duplicateClasses = [];
    }
    Generator.prototype.generateModel = function (params) {
        var jsonData = params.jsonData, rootClassName = params.rootClassName;
        if (jsonData) {
            this.objectStack = [{ moduleName: rootClassName, moduleContent: jsonData }];
            this.recordObjectClass(rootClassName);
        }
        this.deqeue();
        if (!this.model) {
            this.model = '';
        }
        var modelInfo = {
            model: this.model || '',
            duplicateClasses: this.duplicateClasses || []
        };
        return modelInfo;
    };
    Generator.prototype.deqeue = function () {
        while (this.objectStack.length > 0) {
            var moduleInfo = this.objectStack.shift();
            this.model += this.generateModule(moduleInfo);
        }
    };
    Generator.prototype.generateModule = function (moduleInfo) {
        var moduleName = moduleInfo.moduleName, _a = moduleInfo.moduleContent, moduleContent = _a === void 0 ? {} : _a;
        if (moduleName && moduleContent) {
            var moduleString = 'export module ' + moduleName + ' {\n';
            var prefix = '\t';
            var interface_t = prefix + 'export interface t {\n';
            var interface_safe_t = prefix + 'export interface safe_t' + ' {\n';
            var interface_safe_func = prefix + 'export function safe(m: t): safe_t {\n\t\tconst u = m == null ? {} as t : m\n\t\tconst s = {} as safe_t\n';
            prefix = '\t\t';
            for (var key in moduleContent) {
                var value = moduleContent[key];
                var metaType = this.getType(value);
                var actualType = metaType;
                var defaultValue = this.getDefaultValue(metaType);
                if (metaType == 'object') {
                    actualType = this.upcaseFirstLetter(key);
                    if (!this.moduleMap.has(actualType)) {
                        this.objectStack.push({ moduleName: actualType, moduleContent: value });
                        this.recordObjectClass(actualType);
                    }
                    else {
                        this.recordDuplicateClass(actualType);
                    }
                }
                else if (metaType == 'array') {
                    if (value.length > 0) {
                        var firstElem = value[0];
                        if (firstElem) {
                            actualType = this.getArrayElememtType(firstElem, key) + '[]';
                        }
                        else {
                            actualType = 'null[]';
                        }
                    }
                    else {
                        actualType = 'null[]';
                    }
                }
                if (metaType == 'object') {
                    interface_t += prefix + key + '?: ' + actualType + '.t;\n';
                    interface_safe_t += prefix + key + ': ' + actualType + '.safe_t;\n';
                    interface_safe_func += prefix + 's.' + key + ' = u.' + key + ' == null ? ' + actualType + '.safe(<' + actualType + '.t>{}) : ' + actualType + '.safe(u.' + key + ')\n';
                }
                else if (metaType == 'array') {
                    var loc = actualType.indexOf('[');
                    var preStr = actualType.substring(0, loc);
                    var suffixStr = actualType.substring(loc, actualType.length);
                    interface_t += prefix + key + '?: ' + preStr + '.t' + suffixStr + ';\n';
                    interface_safe_t += prefix + key + ': ' + preStr + '.safe_t' + suffixStr + ';\n';
                    interface_safe_func += prefix + 's.' + key + ' = u.' + key + ' == null ? ' + defaultValue + ' : u.' + key + '.map((e:' + preStr + '.t) => { return ' + preStr + '.safe(e) })\n';
                }
                else {
                    interface_t += prefix + key + '?: ' + actualType + ';\n';
                    interface_safe_t += prefix + key + ': ' + actualType + ';\n';
                    interface_safe_func += prefix + 's.' + key + ' = u.' + key + ' || ' + defaultValue + '\n';
                }
            }
            interface_safe_func += prefix + 'return s\n';
            prefix = '\t';
            var endStr = prefix + '}\n\n';
            interface_t += endStr;
            interface_safe_t += endStr;
            interface_safe_func += endStr;
            prefix = '';
            endStr = prefix + '}\n\n';
            moduleString += interface_t + interface_safe_t + interface_safe_func + endStr;
            return moduleString;
        }
        else {
            return '';
        }
    };
    Generator.prototype.getType = function (value) {
        switch (typeof (value)) {
            case 'object':
                if (Array.isArray(value)) {
                    return 'array';
                }
                else {
                    return 'object';
                }
            default:
                return typeof (value);
        }
    };
    Generator.prototype.getArrayElememtType = function (value, key) {
        switch (typeof (value)) {
            case 'object':
                if (Array.isArray(value)) {
                    if (value && value.length > 0) {
                        var firstElem = value[0];
                        if (firstElem) {
                            return this.getArrayElememtType(firstElem, key) + '[]';
                        }
                        else {
                            return 'null[]';
                        }
                    }
                    else {
                        return 'null[]';
                    }
                }
                else {
                    var objectClass = this.upcaseFirstLetter(key);
                    if (!this.moduleMap.has(objectClass)) {
                        this.objectStack.push({ moduleName: objectClass, moduleContent: value });
                        this.recordObjectClass(objectClass);
                    }
                    else {
                        this.recordDuplicateClass(objectClass);
                    }
                    return objectClass;
                }
            default:
                return typeof (value);
        }
    };
    Generator.prototype.getDefaultValue = function (type) {
        switch (type) {
            case 'number':
                return 0;
            case 'boolean':
                return false;
            case 'string':
                return '""';
            case 'array':
                return '[]';
            case 'object':
                return '{}';
            default:
                return null;
        }
    };
    Generator.prototype.upcaseFirstLetter = function (str) {
        if (str && str.length > 0) {
            var firstChar = str.substring(0, 1);
            return str.replace(firstChar, firstChar.toUpperCase());
        }
        else {
            return '';
        }
    };
    Generator.prototype.recordObjectClass = function (actualType) {
        this.moduleMap.add(actualType);
    };
    Generator.prototype.recordDuplicateClass = function (actualType) {
        if (this.duplicateClasses.indexOf(actualType) == -1) {
            this.duplicateClasses.push(actualType);
        }
    };
    return Generator;
}());
exports["default"] = Generator;
