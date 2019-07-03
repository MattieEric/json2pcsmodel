# json2pcsmodel
一款由json自动生成Picasso安全model的工具

# 安装方式
npm install -g @dp/json2pcsmodel

# 使用方式
```
->xxxx j2m -i data.json 
```

#### 可选参数
```
-i|--inputFilePath  {#json文件路径}，假如不指定，会二次提示输入json文件路径  
-o|--outputFilePath {#输出文件路径} ，假如不指定，会默认输出在当前目录下，文件名为Model.ts  
-r|--rootClassName  {#根类型名字} ，假如不指定，会将根类型名字指定为RootClass  
-d|--duplicate      {#是否允许生成相同名称的model:allow|disallow}，假如不指定，默认为不允许，效果为遇到同名的model只取第一个生成对应的model；假如指定允许，则可生成所有的同名model，之后需要使用者手动做更改  
-h|--help           帮助项  
```
# 例子
```
j2m -i data.json  
j2m -i /Users/xx/workspace/proj/data.json -o Model.ts  
j2m -i /Users/xx/workspace/proj/data.json -o /Users/xx/workspace/proj/Model.ts -r Response -d allow  
```
