#!/usr/bin/with-contenv bashio

#CONFIG_PATH=/data/options.json
#USERNAME="$(bashio::config 'username')"
#PASSWORD="$(bashio::config 'password')"
#HOST="$(bashio::config 'host')"
#PORT="$(bashio::config 'port')"

python3 -m http.server $(bashio::config 'web_port') --directory /
