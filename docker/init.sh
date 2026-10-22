#!/bin/bash
set -e

if [ -f "/home/frappe/frappe-bench/sites/hrms.localhost/site_config.json" ]; then
    echo "Site already exists, skipping init"
    cd frappe-bench
    bench start
    exit 0
fi

echo "Creating new bench..."
rm -rf /home/frappe/frappe-bench
printf "[client]\nssl=0\n" > /home/frappe/.my.cnf
yarn cache clean
yarn config set registry https://registry.npmjs.org/

export PATH="${NVM_DIR}/versions/node/v${NODE_VERSION:-$NODE_VERSION_PREV}/bin/:${PATH}"

bench init --python python3 --skip-redis-config-generation frappe-bench

cd frappe-bench

# Use containers instead of localhost
bench set-mariadb-host mariadb
bench set-redis-cache-host redis://redis:6379
bench set-redis-queue-host redis://redis:6379
bench set-redis-socketio-host redis://redis:6379

# Remove redis, watch from Procfile and bind to 0.0.0.0
sed -i '/redis/d' ./Procfile
sed -i '/watch/d' ./Procfile
sed -i 's/bench serve/bench serve --host 0.0.0.0/' ./Procfile

echo "Waiting for MariaDB to be ready..."
until mariadb-admin ping -h mariadb -u root -p123 --silent; do
    echo "MariaDB is unavailable - sleeping"
    sleep 2
done
echo "MariaDB is up and ready!"

bench get-app erpnext
bench get-app hrms

bench new-site hrms.localhost \
--force \
--mariadb-root-password 123 \
--admin-password admin \
--no-mariadb-socket

bench --site hrms.localhost install-app hrms
bench --site hrms.localhost set-config developer_mode 1
bench --site hrms.localhost enable-scheduler
bench --site hrms.localhost clear-cache
bench use hrms.localhost

bench start