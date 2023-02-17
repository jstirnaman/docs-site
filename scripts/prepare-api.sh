# To run the commands below, you need the following:
# 1. @redocly/cli installed globally
# 2. oss and cloud API entries in your .redocly.yaml config file.
#
# To use npm to install @redocly/cli globally, enter the following command in your terminal: 
# npm i -g @redocly/cli@latest
#
# To access environment variables in Node process.env while the command runs,
# set them preceding the redocly CLI command.
API_PLATFORM=v2.6 redocly bundle oss --output=./static/openapi/influxdb-oss
API_PLATFORM=cloud redocly bundle cloud --output=./static/openapi/influxdb-cloud

redocly lint ./static/openapi/influxdb-oss.yml --max-problems=1
redocly lint ./static/openapi/influxdb-cloud.yml --max-problems=1

# redocly split ./api-influxdata-ref/cloud.yml --outDir ./api-influxdata-ref/cloud
# redocly split ./api-influxdata-ref/oss.yml --outDir ./api-influxdata-ref/oss
