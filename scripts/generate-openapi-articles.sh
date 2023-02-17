node ./scripts/openapi-paths-to-hugo-data/index.js \
  ./static/openapi/influxdb-cloud.yml \
  -d ./static/openapi/influxdb-cloud \
  -o ./data/article-data/influxdb/cloud

DATA_FOLDER=./data/article-data/influxdb/cloud \
CONTENT_PATH='./content/en/docs/Reference/InfluxDB Cloud API' \
node ./scripts/hugo-data-to-pages/hugo.js generate

node ./scripts/openapi-paths-to-hugo-data/index.js \
  ./static/openapi/influxdb-oss.yml \
  -d ./static/openapi/influxdb-oss \
  -o ./data/article-data/influxdb/oss

DATA_FOLDER=./data/article-data/influxdb/oss \
CONTENT_PATH='./content/en/docs/Reference/InfluxDB OSS API' \
node ./scripts/hugo-data-to-pages/hugo.js generate
