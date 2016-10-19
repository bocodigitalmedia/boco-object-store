class Dependencies
  Error: null
  JSON: null
  JsonPointer: null
  Path: null
  FileSystem: null
  LockManager: null
  setImmediate: null
  __dirname: null

  constructor: (props) ->
    @[key] = val for own key, val of props

    @Error ?= try Error
    @JSON ?= try JSON
    @__dirname ?= try __dirname

    @setImmediate ?= do ->
      return setImmediate if typeof setImmediate is 'function'
      return ((callback) -> setTimeout callback, 0) if typeof setTimeout is 'function'

    if typeof require is 'function'
      @JsonPointer ?= require 'json-ptr'
      @Path ?= require 'path'
      @FileSystem ?= require 'fs'
      @LockManager ?= require('boco-mutex').LockManager

configure = (props) ->
  {
    Error
    JSON
    JsonPointer
    Path
    FileSystem
    LockManager
    setImmediate
    __dirname

  } = dependencies = new Dependencies(props)

  class Exception extends Error
    @getMessage: (payload) -> null

    payload: null

    constructor: (payload) ->
      @name = @constructor.name
      @message = @constructor.getMessage payload
      @payload = payload

      if typeof Error.captureStackTrace is 'function'
        Error.captureStackTrace @, @constructor

  class NotImplemented extends Exception
    @getMessage: (payload) -> "Not implemented."

  class ObjectStore

    constructor: (props) ->
      @[key] = val for own key, val of props

    write: (sourceKey, data, done) ->
      done new NotImplemented

    remove: (sourceKey, done) ->
      done new NotImplemented

    read: (sourceKey, done) ->
      done new NotImplemented

    update: (sourceKey, pointer, updates, done) ->
      @read sourceKey, (error, data) =>
        return done error if error?

        try
          value = JsonPointer.get data, pointer
          value[k] = v for own k, v of updates
        catch error
        finally
          return done error if error?
          return @set(sourceKey, pointer, value, done)

    get: (sourceKey, pointer, done) ->
      @read sourceKey, (error, data) ->
        return done error if error?

        try
          value = JsonPointer.get data, pointer
        catch error
        finally
          return done error if error?
          return done null, value

    set: (sourceKey, pointer, value, done) ->
      @read sourceKey, (error, data) ->
        return done error if error?

        try
          JsonPointer.set data, pointer, value, true
        catch error
        finally
          return done error if error?
          return done()

    getSource: (sourceKey) ->
      new ObjectSource {sourceKey, objectStore: @}

  class ObjectSource
    sourceKey: null
    objectStore: null

    constructor: (props) ->
      @[key] = val for own key, val of props

    write: (data, done) ->
      @objectStore.write @sourceKey, data, done

    read: (done) ->
      @objectStore.read @sourceKey, done

    remove: (done) ->
      @objectStore.remove @sourceKey, done

    get: (pointer, done) ->
      @objectStore.get @sourceKey, pointer, done

    set: (pointer, value, done) ->
      @objectStore.set @sourceKey, pointer, value, done

    update: (pointer, updates, done) ->
      @objectStore.update @sourceKey, pointer, updates, done

  class FileSystemObjectStore extends ObjectStore
    basePath: null
    lockManager: null

    constructor: (props) ->
      super props
      @basePath ?= Path.resolve '.'
      @lockManager ?= new LockManager

    getPath: (sourceKey) ->
      Path.resolve @basePath, sourceKey

    getReadFileArgs: (sourceKey, path) ->
      []

    getWriteFileArgs: (sourceKey, path) ->
      []

    deserialize: (serialized, done) ->
      done new NotImplemented

    serialize: (data, done) ->
      done new NotImplemented

    readFile: (sourceKey, done) ->
      try
        path = @getPath sourceKey
        args = @getReadFileArgs sourceKey, path
      catch error
      finally
        return done error if error
        return FileSystem.readFile path, args..., done

    writeFile: (sourceKey, serialized, done) ->
      try
        path = @getPath sourceKey
        args = @getWriteFileArgs sourceKey, path
      catch error
      finally
        return done error if error?
        return FileSystem.writeFile path, serialized, args..., done

    removeFile: (sourceKey, done) ->
      try
        path = @getPath sourceKey
      catch error
      finally
        return done error if error?
        return FileSystem.unlink path, done

    read: (sourceKey, done) ->
      @readFile sourceKey, (error, serialized) =>
        return done error if error?
        return @deserialize serialized, done

    writeWithoutLock: (sourceKey, data, done) ->
      @serialize data, (error, serialized) =>
        return done error if error?
        return @writeFile sourceKey, serialized, done

    write: (sourceKey, args..., done) ->
      work = @writeWithoutLock.bind @, sourceKey, args...
      @lockManager.get(sourceKey).sync work, done

    removeWithoutLock: (sourceKey, done) ->
      @removeFile sourceKey, done

    remove: (sourceKey, args..., done) ->
      work = @removeWithoutLock.bind @, sourceKey, args...
      @lockManager.get(sourceKey).sync work, done

    get: (sourceKey, pointer, done) ->
      @read sourceKey, (error, data) ->
        return done error if error?

        try
          value = JsonPointer.get data, pointer
        catch error
        finally
          return done error if error?
          return done null, value

    setWithoutLock: (sourceKey, pointer, value, args..., done) ->
      force = args[0] ? true

      @read sourceKey, (error, data) =>
        return done error if error?

        try
          JsonPointer.set data, pointer, value, force
        catch error
        finally
          return done error if error?
          return @writeWithoutLock sourceKey, data, done

    set: (sourceKey, args..., done) ->
      work = @setWithoutLock.bind @, sourceKey, args...
      @lockManager.get(sourceKey).sync work, done

    updateWithoutLock: (sourceKey, pointer, updates, done) ->
      @read sourceKey, (error, data) =>
        return done error if error?
        try
          value = JsonPointer.get data, pointer
          value[k] = v for own k, v of updates
          JsonPointer.set data, pointer, value, true
        catch error
        finally
          return done error if error?
          return @writeWithoutLock sourceKey, data, done

    update: (sourceKey, args..., done) ->
      work = @updateWithoutLock.bind @, sourceKey, args...
      @lockManager.get(sourceKey).sync work, done

  class JsonFileSystemObjectStore extends FileSystemObjectStore

    getPath: (sourceKey) ->
      super(sourceKey) + ".json"

    serialize: (data, done) ->
      try
        json = JSON.stringify data
      catch error
      finally
        return done error if error?
        return done null, json

    deserialize: (json, done) ->
      try
        data = JSON.parse json
      catch error
      finally
        return done error if error?
        return done null, data

  class MemoryObjectStore extends ObjectStore
    objects: null

    write: (sourceKey, data, done) ->
      @objects[sourceKey] = data
      setImmediate -> done()

    read: (sourceKey, done) ->
      data = @objects[sourceKey] ? null
      setImmediate -> done null, data

    remove: (sourceKey, done) ->
      delete @objects[sourceKey] if @objects[sourceKey]?
      setImmediate -> done()

  memory = (props) ->
    new MemoryObjectStore props

  fileSystem = (props) ->
    new FileSystemObjectStore props

  jsonFileSystem = (props) ->
    new JsonFileSystemObjectStore props

  {
    configure
    dependencies
    Dependencies
    Exception
    NotImplemented
    ObjectStore
    ObjectSource
    FileSystemObjectStore
    JsonFileSystemObjectStore
    fileSystem
    jsonFileSystem
  }

module.exports = configure()
