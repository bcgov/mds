/* eslint-disable no-console */
const express = require('express');
const hello = require('./hello');
const handleListen = require('./handleListen');

const PORT = 8080;
const app = express();
app.get('/', hello);
app.listen(PORT, handleListen(console.log, PORT));
