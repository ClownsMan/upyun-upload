const log = require('single-line-log').stdout;

class Progress {
  constructor() {
    this.reminder = '上传进度';
    this.lineLength = 30;
  }

  render(options) {
    let percent = (options.completeNum / options.totalNum).toFixed(2);
    let cell_num = Math.floor(percent*this.lineLength);
    let complete_line = '', uncomplete_line = '';
    for(let i = 0; i < cell_num; i++) {
      complete_line += '*'
    }
    for(let i = 0; i < (this.lineLength - cell_num); i++) {
      uncomplete_line += '-'
    }
    log(`${this.reminder}: ${100*percent}% ${complete_line}${uncomplete_line}${options.completeNum}/${options.totalNum}\n`)
  }
}

module.exports = Progress;
