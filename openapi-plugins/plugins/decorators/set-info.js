module.exports = SetInfo;

const { info } = require('../../content/content')

/** @type {import('@redocly/cli').Oas3Decorator} */
function SetInfo() {
  const data = info();

  return {
    Info: {
      leave(info, ctx) {
        if(data) {
          if(data.hasOwnProperty('title')) {
             info.title = data.title;
          }
	        if(data.hasOwnProperty('version')) {
             info.version = data.version;
          }
          if(data.hasOwnProperty('description')) {
             info.description = data.description;
          }
          if(data.hasOwnProperty('license')) {
             info.license = data.license;
          }
	      }
      }
    }
  }
}
