require('dotenv').config()
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const url = require('url');

const app = express();



//env variables
const client_id = process.env.CLIENT_ID || null
const client_secret = process.env.CLIENT_SECRET || null
const redirect_uri = process.env.REDIRECT_URI || null

//hydrate params
const tokenAuthEndpoint = 'https://accounts.spotify.com/api/token'
const combotoBuffer = Buffer.from(client_id +':'+ client_secret).toString('base64')   
const headerHandle = {
    headers:{
    'Authorization': 'Basic ' + (combotoBuffer),
    'content-type': 'application/x-www-form-urlencoded',
    }
}

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken
        //query params for refreshing
    const queryS = new url.URLSearchParams()
    queryS.append('grant_type', 'refresh_token')
    queryS.append('refresh_token', refreshToken)
    queryS.append('redirect_uri', redirect_uri)

    axios.post(
        tokenAuthEndpoint,
        queryS.toString(),
        headerHandle
        ).then((data) => {        
            console.log('refresh complete token parity: ', data.body.accessToken)    
            res.json({
                accessToken: data.body.accessToken,
                expiresIn: data.body.expiresIn
            })
        }
        ).catch((err) => {
          console.log(err)
        })
})

app.post('/login', (req, res) => {
    const code = req.body.code         
    //query params for logging in
    const queryS = new url.URLSearchParams()
    queryS.append('grant_type', 'authorization_code')
    queryS.append('code', code)
    queryS.append('redirect_uri', redirect_uri)
//###post request using axios and manually setting headers
    axios.post(
        tokenAuthEndpoint,
        queryS.toString(),
        headerHandle
        ).then((response) => {   
            console.log(response.data)         
            res.json({
                accessToken: response.data.access_token,
                token_type: response.data.token_type,
                expiresIn: response.data.expires_in,
                refreshToken: response.data.refresh_token
            })
        }
        ).catch((err) => {
            console.log("error: ", err);
        })    
})

app.listen(3001)