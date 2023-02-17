const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const argparse = require('argparse');
const { root } = require('postcss');

const cli = new argparse.ArgumentParser({
  prog:  'openapi-content',
  add_help: true
});

cli.add_argument('-d', '--data-output', {
  help:   'Filepath where generated OpenAPI data output will be written.',
  dest:   'dataOutPath'
})

cli.add_argument('-o', '--article-data-output', {
  help:   'Filepath where generated article metadata output will be written.',
  dest:   'articleOutPath'
})

cli.add_argument('-pre', '--path-prefix', {
  help:   'A path to use as the prefix for the path property in each generated article.',
  dest:   'pathPrefix'
})

cli.add_argument('file', {
  help:   'File to read, utf-8 encoded without BOM',
  nargs:  '?',
  default: '-'
});


////////////////////////////////////////////////////////////////////////////////


var options = cli.parse_args();
const sourceFilepath = path.dirname(options.file);
const filenamePrefix = `${path.parse(options.file).name}-`;

/* Usage examples
 * 
 node ./scripts/openapi-paths-to-hugo-data/index.js \
  ./data/influxdb/cloud/openapi.yaml \
  -d ./data/influxdb/cloud/path-apis \
  -o ./data/article-data/influxdb/cloud/path-apis

 node ./scripts/openapi-paths-to-hugo-data/index.js \
   ./data/influxdb/oss/openapi.yaml \
   -d ./data/influxdb/oss/path-apis \
   -o ./data/article-data/influxdb/oss/path-apis
 *
 */

////////////////////////////////////////////////////////////////////////////////

function readFile(filepath, encoding, callback) {
  return yaml.load(fs.readFileSync(filepath, encoding));
}

function writeDataFile(data, outputTo, callback) {
  fs.writeFileSync(outputTo, yaml.dump(data));
}

const openapiUtils = {
  isPlaceholderFragment: function(str) {
    const placeholderRegex = new RegExp('^\{.*\}$');
    return placeholderRegex.test(str);
  }
}

function writePathOpenapis(openapi, prefix) {
  const pathGroups = {};
  Object.keys(openapi.paths).sort()
  .forEach((p) => {
    const delimiter = '/';
    let key = p.split(delimiter);
   
    let isItemPath = openapiUtils.isPlaceholderFragment(key[key.length - 1]);
    if(isItemPath) {
      key = key.slice(0, -1);
    }
    key = (key.slice(0, 4))

    isItemPath = openapiUtils.isPlaceholderFragment(key[key.length - 1]);
    if(isItemPath) {
      key = key.slice(0, -1);
    }
    const groupKey = key.join('/');
    pathGroups[groupKey] = pathGroups[groupKey] || {};
    pathGroups[groupKey][p] = openapi.paths[p];
  })

  Object.keys(pathGroups).forEach(pg => {
    // Deep copy openapi.
    let doc = JSON.stringify(openapi);
    doc = JSON.parse(doc);
    doc.paths = pathGroups[pg];
    doc.info.title = `${pg}\n${doc.info.title}`;
    doc['x-pathGroup'] = pg;
    try {
      if (!fs.existsSync(options.dataOutPath)) {
        fs.mkdirSync(options.dataOutPath, {recursive: true});
      }
      const outPath = path.resolve(options.dataOutPath, `${prefix}${pg.replaceAll('/', '-').replace(/^-/, '')}.yaml`);
      writeDataFile(doc, outPath);
    } catch (err) {
      console.error(err);
    }
   })
}

function createArticleDataForPathGroup(openapi) {
  const article = {
    path: '',
    fields: {
      name: openapi['x-pathGroup'],
      describes: Object.keys(openapi.paths)
    }
  };
  const snakifyPath = (p) => {
    if(!path) {
      return;
    }
    return p.replace(/^\//, '')
            .replaceAll('/', '-');
  }
  article.path = snakifyPath(openapi['x-pathGroup']);
  article.fields.title = openapi.info && openapi.info.title;
  article.fields.description = openapi.description;
  const pathGroupFrags = path.parse(openapi['x-pathGroup']);
    article.fields.tags = ([pathGroupFrags?.dir, pathGroupFrags?.name]).map(
    t => snakifyPath(t)
  )
  return article;
}

function writeOpenapiArticleData(sourcePath, targetPath, opts) {
  const isFile = filePath => {
    return fs.lstatSync(filePath).isFile();
  };

  const matchesPattern = filePath => {
    return opts.filePattern ? path.parse(filePath).name.startsWith(opts.filePattern) : true;
  };
  
  try {
    const articles = fs.readdirSync(sourcePath)
    .map(fileName => {
      return path.join(sourcePath, fileName);
    })
    .filter(matchesPattern)
    .filter(isFile)
    .map(filePath => {
      const openapi = readFile(filePath);
      const article = createArticleDataForPathGroup(openapi);
      article.fields.source = filePath;
      article.fields.staticFilePath = filePath.replace(/^static\//, '/'); // This might appear counterintuitive; Hugo omits "/static" from the URI when serving files stored in the "./static" directory.  
      return article;
    });
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, {recursive: true});
    }
    const articlePath = path.resolve(targetPath, 'articles.yml');
    writeDataFile({ articles }, articlePath);
  } catch(e) {
    console.log(e);
  }
}

const sourceFile = readFile(options.file, 'utf8');
console.log('Generating OpenAPI data....');
writePathOpenapis(sourceFile, filenamePrefix);

const openapiSrcPath = options.dataOutPath;
console.log('Generating OpenAPI article data....');
writeOpenapiArticleData(openapiSrcPath, options.articleOutPath, {filePattern: filenamePrefix});
