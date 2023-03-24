#!/usr/bin/with-contenv bashio

python3 -m http.server $(bashio::config 'web_port') --directory /
