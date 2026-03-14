const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, '../private.pem');
const publicKeyPath = path.join(__dirname, '../public.pem');

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

module.exports = {
    privateKey,
    publicKey
};
