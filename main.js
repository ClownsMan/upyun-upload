const Progress = require('./progress');
const fs = require('fs');
const upyun = require('upyun');


// 本质：获取所有需要上传的文件夹下的文件，然后通过又拍云自己的sdk上传文件到指定的文件夹下
// 1. 处理文件夹下的所有文件，组成数组 handlerFile
// 2. 初始化函数， 判断文件是否正常，文件是否存在，然后上传文件
// 3. 上传文件函数， 创建又拍云实例，然后调用方法上传每个文件，处理成功和失败回调函数
// options {} Object { filePath, upyunPath, operatorName, operatorPassword,  }


class UpyunUpload {
  constructor(options) {
    this.filePath = options.filePath || '';
    this.upyunName = options.upyunName || ''; // 又拍云服务名
    this.upyunPath = options.upyunPath || ''; // 又拍云储存文件路径
    this.operatorName = options.operatorName || ''; // 操作员名
    this.operatorPassword = options.operatorPassword || ''; // 操作员密码
    this.uploadFileList = [];
    this.start();
  }

  // 启动
  start() {
    this.fileSend((fileList) => {
      if(fileList.length > 0) { // 上传文件数量大于0，表示文件位置正确
        const service = new upyun.Service(this.upyunName, this.operatorName, this.operatorPassword)
        const client = new upyun.Client(service);
        let pr = new Progress();
        fileList.map(item => {
          client.putFile(item.key, fs.readFileSync(item.localPath)).then(res => {
            this.uploadFileList.push(item)
            pr.render({
              completeNum: this.uploadFileList.length,
              totalNum: fileList.length,
            })
            if(this.uploadFileList.length === fileList.length) {
              console.log('上传成功')
            }else {
              console.log('上传失败')
            }
          }).catch(err => {
            console.log('单个文件上传失败')
          })
        })
      }else {
        console.log('文件未找到')
      }
    })
  }

  /**
   * @function fileSend 传输文件
   * @param cb {function} 获取文件后需要执行的回调函数
   * @author wyc 2020/8/26
   * */
  fileSend(cb) {
    let fileList = [];
    this.handlerFile(this.filePath, fileList)
    cb && cb(fileList);
  }

  /**
   * @function handlerFile 处理文件夹下的文件
   * @param localPath {String} 上传的本地文件夹
   * @param fileList Array 上传的本地文件夹
   * @author wyc 2020/8/26
   * */
  handlerFile(localPath, fileList) {
    fs.readdirSync(localPath).map(item => { // fs.readdirSync(path) 读取目录path的内容,同步
      let url = `${localPath}/${item}`;
      if(fs.existsSync(url)) {  // 判断当前路径是否存在
        if(fs.statSync(url).isDirectory()) { // 判断当前路径是否为文件夹
          this.handlerFile(url, fileList)
        }else {
          fileList.push({
            key: `${this.upyunPath}/${item}`,
            localPath: url
          })
        }
      }
    });
  }
}

module.exports = UpyunUpload;