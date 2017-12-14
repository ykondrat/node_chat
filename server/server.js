import express from 'express';
import http from 'http';
import io from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './mongodb/DataBase.js';
import config from './config/config.json';

const app = express();
const port = process.env.PORT || config.serverPort;
const server = http.Server(app);
const client = io(server);

app.set("view options", { layout: false });
app.use(express.static(__dirname + './../public'));
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

db.setConnection();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/api/messages/count', (req, res) => {
	db.getCount().then((data) => {res.send({ count: data })});
});
app.get('/api/messages/listall', (req, res) => {
	db.listOfAllMsg().then(data => res.send(data));
});
app.get('/api/messages/list/:index', (req, res) => {
	db.getMsglimit(parseInt(req.params.index)).then(data => res.send(data));
});
app.get('/api/messages/single/:id', (req, res) => {
	db.getMsgById(req.params.id).then(data => res.send(data));
});
app.post('/api/messages/save', (req, res) => {
	db.saveMsg(req.body).then(data => res.send(data));
});
app.put('/api/messages/update/:id', (req, res) => {
	db.updateMsg(req.params.id, req.body).then(data => res.send(data));
});

client.on('connection', function(socket) {
    console.log('User connected');

    let sendStatus = function(status) {
        socket.emit('status', status);
    }

    db.getCount().then((data) => {
        db.getMsglimit(parseInt(data / 10)).then(data => socket.emit('output', data));
    });

    socket.on('input', function(data) {
        let author = data.author;
        let message = data.message.trim();
        let filterEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let filterMsg = /^.{1,100}$/;

        if (!filterEmail.test(author)) {
            sendStatus('Please enter valid email');
        } else {
            if (!filterMsg.test(message)) {
                sendStatus('Please enter valid message');
            } else {
                db.saveMsg(data).then((dataMsg) => {
                    client.emit('output', [dataMsg]);
                    sendStatus({
                        message: 'Message sent',
                        done: true
                    });
                });
            }
        }
    });

    socket.on('disconnect', function(){
        console.log('User disconnected');
    });
});

server.listen(port, function(){
    console.log(`Server listening on port: ${port}`);
});
