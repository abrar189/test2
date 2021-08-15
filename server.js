'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const server = express();
const PORT = process.env.PORT
const mongoose = require('mongoose');
const { default: axios } = require('axios');
server.use(cors());
server.use(express.json());
mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
// http://localhost:3008
server.get('/', (req, res) => {
    res.send('helloooooo')
})
const dragonSchema = new mongoose.Schema({
    name: String,
    img: String,
    level: String,

});

const userSchema = new mongoose.Schema({
    email: String,
    alldata: [dragonSchema]


});
const user = mongoose.model('user', userSchema);

function seedData() {
    let userData = new user({
        email: 'algourabrar@gmail.com',
        alldata: [{

            "name": "Koromon",
            "img": "https://digimon.shadowsmith.com/img/koromon.jpg",
            "level": "In Training"
        },
        {

            "name": "Yokomon",
            "img": "https://digimon.shadowsmith.com/img/yokomon.jpg",
            "level": "In Training"
        }]
    })
    userData.save();
}
// seedData();

// http://localhost:3008/dataDB?email=
server.get('/dataDB', datafromDB)
function datafromDB(req, res) {
    let email = req.query.email
    user.find({ email: email }, (error, userData) => {
        if (error) {
            res.send(error)

        } else {
            res.send(userData[0].alldata)
        }
    })
}

// https://digimon-api.vercel.app/api/digimon
// http://localhost:3008/apidata
let memory = {};
server.get('/apidata', datafromapi)
async function datafromapi(req, res) {
    let url = 'https://digimon-api.vercel.app/api/digimon'

    if (memory["apidata"] !== undefined) {
        res.send(memory["apidata"])

    } else {
        const apiData = await axios.get(url);
        const apiMap = apiData.data.map(item => {
            return new objData(item);
        })
        memory["apidata"] = apiMap
        res.send(apiMap)
    }

}
class objData{
    constructor(data){
        this.name=data.name;
        this.img=data.img;
        this.level=data.level;

    }
}

// http://localhost:3008/addtoFav

server.post('/addtoFav' ,addtoFav)
function addtoFav(req,res){
    let {email,name,img,level} = req.body
    user.find({ email: email }, (error, userData) => {
        if (error) {
            res.send(error)

        } else {
            const newFav={
                name:name,
                img:img,
                level:level,
            }
            userData[0].alldata.push(newFav)
           
        }
        userData[0].save();
        res.send(userData[0])
    })
}

// http://localhost:3008/delete?email=
server.delete('/delete/:idx',deleteFun)
function deleteFun(req,res){
    let idx= req.params.idx;
    let email = req.query.email;
    user.findOne({ email: email }, (error, userData) => {
        if (error) {
            res.send(error)

        } else {
            userData.alldata.splice(idx,1);
            userData.save();
            res.send(userData.alldata)
        }
    })
}

// http://localhost:3008/update
server.put('/update/:idx',updatefun)
function updatefun(req,res){
    let idx= req.params.idx;
    let {email,name,img,level} = req.body;
    user.findOne({ email: email }, (error, userData) => {
        if (error) {
            res.send(error)

        } else {
            userData.alldata.splice(idx,1,{
                name:name,
                img:img,
                level:level,
            });
            userData.save();
            res.send(userData.alldata)
        }
    })
}

server.listen(PORT, () => {
    console.log(`listen to ${PORT}`);
})