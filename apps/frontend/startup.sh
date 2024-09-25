#! /bin/sh

certbot --nginx -d connect4.khai.graduate-program.journeyone.com.au -m "${CERTBOT_EMAIL}" --agree-tos