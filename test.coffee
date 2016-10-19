ObjectStore = require './source'
store = new ObjectStore.jsonFileSystem()

steps = []

steps.push (done) ->
  store.write 'test', data: { hello: null, foo: "foo" }, done

steps.push (done) ->
  store.set 'test', '/data/goodbye', 'cruel world', done

steps.push (done) ->
  store.update 'test', '/data', hello: 'world', done

steps.push (done) ->
  store.get 'test', '/data', (error, data) ->
    return done error if error?
    console.log 'get test /data', JSON.stringify(data) + "\n"
    done()

steps.push (done) ->
  store.read 'test', (error, data) ->
    return done error if error?
    console.log 'read test', JSON.stringify(data) + "\n"
    done()

require('async').series steps, (error) ->
  throw error if error?
  process.exit 0
