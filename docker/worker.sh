#!/bin/sh
set -e
exec celery -A orders_service worker -l info
