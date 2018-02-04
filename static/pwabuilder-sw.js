self.addEventListener( 'install', ( event ) => {
  var indexPage = new Request( 'index.html' )
  event.waitUntil(
    fetch( indexPage ).then( ( response ) => {
      return caches.open( 'pwabuilder-offline' ).then( ( cache ) => {
        console.log( `[PWA Builder] Cached index page during Install ${response.url}` )
        return cache.put( indexPage, response )
      } )
    } ) )
} )

self.addEventListener( 'fetch', ( event ) => {
  var updateCache = ( request ) => {
    return caches.open( 'pwabuilder-offline' ).then( ( cache ) => {
      return fetch( request ).then( ( response ) => {
        console.log( `[PWA Builder] add page to offline ${response.url}` )
        return cache.put( request, response )
      } )
    } )
  }

  event.waitUntil( updateCache( event.request ) )

  event.respondWith(
    fetch( event.request ).catch( ( error ) => {
      console.log( `[PWA Builder] Network request Failed. Serving content from cache: ${error}` )

      return caches.open( 'pwabuilder-offline' ).then( ( cache ) => {
        return cache.match( event.request ).then( ( matching ) => {
          return !matching || matching.status == 404 ? Promise.reject( 'no-match' ) : matching
        } )
      } )
    } )
  )
} )
