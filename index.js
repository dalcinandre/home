const express = require( 'express' )
const app = express()
const fs = require( 'fs' )
const { exec } = require( 'child_process' )
const path = require( 'path' )
const Gpio = require( 'onoff' ).Gpio
const portao = new Gpio( 17, 'high' )
const aberto = new Gpio( 4, 'in', 'both' )

const https = require( 'https' ).createServer( {
    key: fs.readFileSync( path.resolve( '../create-certificate/server.key' ) ),
    cert: fs.readFileSync( path.resolve( '../create-certificate/server.crt' ) )
}, app )
const io = require( 'socket.io' )( https )

app.use( '/js', express.static( `${ __dirname }/node_modules/bootstrap/dist/js` ))
app.use( '/js', express.static( `${ __dirname }/node_modules/jquery/dist` ))
app.use( '/js', express.static( `${ __dirname }/node_modules/vue/dist` ))
app.use( '/css', express.static( `${ __dirname }/node_modules/bootstrap/dist/css` ))
app.use( '/css', express.static( `${ __dirname }/node_modules/material-design-icons` ))

app.use( express.static( `${ __dirname }/static` ) )

io.on( 'connection', ( socket ) => {
    console.log( `IP: ${ socket.conn.remoteAddress.split( ':' ).slice( -1 )[0] } conectado as ${ new Date() } `)
    socket.on( 'portao', () => {
        portao.writeSync( 0 )
        setTimeout( () => portao.writeSync( 1 ), 200 )
    })

    socket.on( 'temp', () => {
        exec( 'vcgencmd measure_temp', ( error, stdout, stderr ) => {
            if ( error ) throw error

            let temp = {
                temp: stdout.split('=').slice( -1 )[ 0 ].split('\'')[ 0 ]
            }

            socket.emit( 'temp', temp )
        })
    })
} )

https.listen(4443, () => {
    console.log( 'listening on *:4443' )
} )

aberto.watch( ( err, value ) => {
    console.log( value )
} )

process.on( 'SIGINT', () => {
    portao.unexport()
    aberto.unexport()
    process.exit( 0 )
} )
