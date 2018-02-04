const express = require( 'express' )
const app = express()
const fs = require( 'fs' )
const path = require( 'path' )

const certOptions = {
  key: fs.readFileSync( path.resolve( '../create-certificate/server.key' ) ),
  cert: fs.readFileSync( path.resolve( '../create-certificate/server.crt' ) )
}

const https = require( 'https' ).createServer( certOptions, app )
const io = require( 'socket.io' )( https )

app.use( '/js', express.static( `${ __dirname }/node_modules/bootstrap/dist/js` ))
app.use( '/js', express.static( `${ __dirname }/node_modules/jquery/dist` ))
app.use( '/js', express.static( `${ __dirname }/node_modules/vue/dist` ))
app.use( '/css', express.static( `${ __dirname }/node_modules/bootstrap/dist/css` ))
app.use( '/css', express.static( `${ __dirname }/node_modules/material-design-icons` ))

app.use( express.static( `${ __dirname }/static` ) )

io.on( 'connection', ( socket ) => {
  socket.on( 'portao', () => console.log( 'executou ' + new Date() ) )
} )

https.listen(4443, () => {
  console.log( 'listening on *:4443' )
})
