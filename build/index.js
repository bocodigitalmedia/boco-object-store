// Generated by CoffeeScript 1.11.1
var Dependencies, configure,
  hasProp = {}.hasOwnProperty,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  slice = [].slice;

Dependencies = (function() {
  Dependencies.prototype.Error = null;

  Dependencies.prototype.JSON = null;

  Dependencies.prototype.JsonPointer = null;

  Dependencies.prototype.Path = null;

  Dependencies.prototype.FileSystem = null;

  Dependencies.prototype.LockManager = null;

  Dependencies.prototype.setImmediate = null;

  Dependencies.prototype.__dirname = null;

  function Dependencies(props) {
    var key, val;
    for (key in props) {
      if (!hasProp.call(props, key)) continue;
      val = props[key];
      this[key] = val;
    }
    if (this.Error == null) {
      this.Error = (function() {
        try {
          return Error;
        } catch (error1) {}
      })();
    }
    if (this.JSON == null) {
      this.JSON = (function() {
        try {
          return JSON;
        } catch (error1) {}
      })();
    }
    if (this.__dirname == null) {
      this.__dirname = (function() {
        try {
          return __dirname;
        } catch (error1) {}
      })();
    }
    if (this.setImmediate == null) {
      this.setImmediate = (function() {
        if (typeof setImmediate === 'function') {
          return setImmediate;
        }
        if (typeof setTimeout === 'function') {
          return (function(callback) {
            return setTimeout(callback, 0);
          });
        }
      })();
    }
    if (typeof require === 'function') {
      if (this.JsonPointer == null) {
        this.JsonPointer = require('json-ptr');
      }
      if (this.Path == null) {
        this.Path = require('path');
      }
      if (this.FileSystem == null) {
        this.FileSystem = require('fs');
      }
      if (this.LockManager == null) {
        this.LockManager = require('boco-mutex').LockManager;
      }
    }
  }

  return Dependencies;

})();

configure = function(props) {
  var Error, Exception, FileSystem, FileSystemObjectStore, JSON, JsonFileSystemObjectStore, JsonPointer, LockManager, MemoryObjectStore, NotImplemented, ObjectSource, ObjectStore, Path, __dirname, dependencies, fileSystem, jsonFileSystem, memory, ref, setImmediate;
  ref = dependencies = new Dependencies(props), Error = ref.Error, JSON = ref.JSON, JsonPointer = ref.JsonPointer, Path = ref.Path, FileSystem = ref.FileSystem, LockManager = ref.LockManager, setImmediate = ref.setImmediate, __dirname = ref.__dirname;
  Exception = (function(superClass) {
    extend(Exception, superClass);

    Exception.getMessage = function(payload) {
      return null;
    };

    Exception.prototype.payload = null;

    function Exception(payload) {
      this.name = this.constructor.name;
      this.message = this.constructor.getMessage(payload);
      this.payload = payload;
      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
      }
    }

    return Exception;

  })(Error);
  NotImplemented = (function(superClass) {
    extend(NotImplemented, superClass);

    function NotImplemented() {
      return NotImplemented.__super__.constructor.apply(this, arguments);
    }

    NotImplemented.getMessage = function(payload) {
      return "Not implemented.";
    };

    return NotImplemented;

  })(Exception);
  ObjectStore = (function() {
    function ObjectStore(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
    }

    ObjectStore.prototype.write = function(sourceKey, data, done) {
      return done(new NotImplemented);
    };

    ObjectStore.prototype.remove = function(sourceKey, done) {
      return done(new NotImplemented);
    };

    ObjectStore.prototype.read = function(sourceKey, done) {
      return done(new NotImplemented);
    };

    ObjectStore.prototype.update = function(sourceKey, pointer, updates, done) {
      return this.read(sourceKey, (function(_this) {
        return function(error, data) {
          var k, results, v, value;
          if (error != null) {
            return done(error);
          }
          try {
            value = JsonPointer.get(data, pointer);
            results = [];
            for (k in updates) {
              if (!hasProp.call(updates, k)) continue;
              v = updates[k];
              results.push(value[k] = v);
            }
            return results;
          } catch (error1) {
            error = error1;
          } finally {
            if (error != null) {
              return done(error);
            }
            return _this.set(sourceKey, pointer, value, done);
          }
        };
      })(this));
    };

    ObjectStore.prototype.get = function(sourceKey, pointer, done) {
      return this.read(sourceKey, function(error, data) {
        var value;
        if (error != null) {
          return done(error);
        }
        try {
          return value = JsonPointer.get(data, pointer);
        } catch (error1) {
          error = error1;
        } finally {
          if (error != null) {
            return done(error);
          }
          return done(null, value);
        }
      });
    };

    ObjectStore.prototype.set = function(sourceKey, pointer, value, done) {
      return this.read(sourceKey, function(error, data) {
        if (error != null) {
          return done(error);
        }
        try {
          return JsonPointer.set(data, pointer, value, true);
        } catch (error1) {
          error = error1;
        } finally {
          if (error != null) {
            return done(error);
          }
          return done();
        }
      });
    };

    ObjectStore.prototype.getSource = function(sourceKey) {
      return new ObjectSource({
        sourceKey: sourceKey,
        objectStore: this
      });
    };

    return ObjectStore;

  })();
  ObjectSource = (function() {
    ObjectSource.prototype.sourceKey = null;

    ObjectSource.prototype.objectStore = null;

    function ObjectSource(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
    }

    ObjectSource.prototype.write = function(data, done) {
      return this.objectStore.write(this.sourceKey, data, done);
    };

    ObjectSource.prototype.read = function(done) {
      return this.objectStore.read(this.sourceKey, done);
    };

    ObjectSource.prototype.remove = function(done) {
      return this.objectStore.remove(this.sourceKey, done);
    };

    ObjectSource.prototype.get = function(pointer, done) {
      return this.objectStore.get(this.sourceKey, pointer, done);
    };

    ObjectSource.prototype.set = function(pointer, value, done) {
      return this.objectStore.set(this.sourceKey, pointer, value, done);
    };

    ObjectSource.prototype.update = function(pointer, updates, done) {
      return this.objectStore.update(this.sourceKey, pointer, updates, done);
    };

    return ObjectSource;

  })();
  FileSystemObjectStore = (function(superClass) {
    extend(FileSystemObjectStore, superClass);

    FileSystemObjectStore.prototype.basePath = null;

    FileSystemObjectStore.prototype.lockManager = null;

    function FileSystemObjectStore(props) {
      FileSystemObjectStore.__super__.constructor.call(this, props);
      if (this.basePath == null) {
        this.basePath = Path.resolve('.');
      }
      if (this.lockManager == null) {
        this.lockManager = new LockManager;
      }
    }

    FileSystemObjectStore.prototype.getPath = function(sourceKey) {
      return Path.resolve(this.basePath, sourceKey);
    };

    FileSystemObjectStore.prototype.getReadFileArgs = function(sourceKey, path) {
      return [];
    };

    FileSystemObjectStore.prototype.getWriteFileArgs = function(sourceKey, path) {
      return [];
    };

    FileSystemObjectStore.prototype.deserialize = function(serialized, done) {
      return done(new NotImplemented);
    };

    FileSystemObjectStore.prototype.serialize = function(data, done) {
      return done(new NotImplemented);
    };

    FileSystemObjectStore.prototype.readFile = function(sourceKey, done) {
      var args, error, path;
      try {
        path = this.getPath(sourceKey);
        return args = this.getReadFileArgs(sourceKey, path);
      } catch (error1) {
        error = error1;
      } finally {
        if (error) {
          return done(error);
        }
        return FileSystem.readFile.apply(FileSystem, [path].concat(slice.call(args), [done]));
      }
    };

    FileSystemObjectStore.prototype.writeFile = function(sourceKey, serialized, done) {
      var args, error, path;
      try {
        path = this.getPath(sourceKey);
        return args = this.getWriteFileArgs(sourceKey, path);
      } catch (error1) {
        error = error1;
      } finally {
        if (error != null) {
          return done(error);
        }
        return FileSystem.writeFile.apply(FileSystem, [path, serialized].concat(slice.call(args), [done]));
      }
    };

    FileSystemObjectStore.prototype.removeFile = function(sourceKey, done) {
      var error, path;
      try {
        return path = this.getPath(sourceKey);
      } catch (error1) {
        error = error1;
      } finally {
        if (error != null) {
          return done(error);
        }
        return FileSystem.unlink(path, done);
      }
    };

    FileSystemObjectStore.prototype.read = function(sourceKey, done) {
      return this.readFile(sourceKey, (function(_this) {
        return function(error, serialized) {
          if (error != null) {
            return done(error);
          }
          return _this.deserialize(serialized, done);
        };
      })(this));
    };

    FileSystemObjectStore.prototype.writeWithoutLock = function(sourceKey, data, done) {
      return this.serialize(data, (function(_this) {
        return function(error, serialized) {
          if (error != null) {
            return done(error);
          }
          return _this.writeFile(sourceKey, serialized, done);
        };
      })(this));
    };

    FileSystemObjectStore.prototype.write = function() {
      var args, done, i, ref1, sourceKey, work;
      sourceKey = arguments[0], args = 3 <= arguments.length ? slice.call(arguments, 1, i = arguments.length - 1) : (i = 1, []), done = arguments[i++];
      work = (ref1 = this.writeWithoutLock).bind.apply(ref1, [this, sourceKey].concat(slice.call(args)));
      return this.lockManager.get(sourceKey).sync(work, done);
    };

    FileSystemObjectStore.prototype.removeWithoutLock = function(sourceKey, done) {
      return this.removeFile(sourceKey, done);
    };

    FileSystemObjectStore.prototype.remove = function() {
      var args, done, i, ref1, sourceKey, work;
      sourceKey = arguments[0], args = 3 <= arguments.length ? slice.call(arguments, 1, i = arguments.length - 1) : (i = 1, []), done = arguments[i++];
      work = (ref1 = this.removeWithoutLock).bind.apply(ref1, [this, sourceKey].concat(slice.call(args)));
      return this.lockManager.get(sourceKey).sync(work, done);
    };

    FileSystemObjectStore.prototype.get = function(sourceKey, pointer, done) {
      return this.read(sourceKey, function(error, data) {
        var value;
        if (error != null) {
          return done(error);
        }
        try {
          return value = JsonPointer.get(data, pointer);
        } catch (error1) {
          error = error1;
        } finally {
          if (error != null) {
            return done(error);
          }
          return done(null, value);
        }
      });
    };

    FileSystemObjectStore.prototype.setWithoutLock = function() {
      var args, done, force, i, pointer, ref1, sourceKey, value;
      sourceKey = arguments[0], pointer = arguments[1], value = arguments[2], args = 5 <= arguments.length ? slice.call(arguments, 3, i = arguments.length - 1) : (i = 3, []), done = arguments[i++];
      force = (ref1 = args[0]) != null ? ref1 : true;
      return this.read(sourceKey, (function(_this) {
        return function(error, data) {
          if (error != null) {
            return done(error);
          }
          try {
            return JsonPointer.set(data, pointer, value, force);
          } catch (error1) {
            error = error1;
          } finally {
            if (error != null) {
              return done(error);
            }
            return _this.writeWithoutLock(sourceKey, data, done);
          }
        };
      })(this));
    };

    FileSystemObjectStore.prototype.set = function() {
      var args, done, i, ref1, sourceKey, work;
      sourceKey = arguments[0], args = 3 <= arguments.length ? slice.call(arguments, 1, i = arguments.length - 1) : (i = 1, []), done = arguments[i++];
      work = (ref1 = this.setWithoutLock).bind.apply(ref1, [this, sourceKey].concat(slice.call(args)));
      return this.lockManager.get(sourceKey).sync(work, done);
    };

    FileSystemObjectStore.prototype.updateWithoutLock = function(sourceKey, pointer, updates, done) {
      return this.read(sourceKey, (function(_this) {
        return function(error, data) {
          var k, v, value;
          if (error != null) {
            return done(error);
          }
          try {
            value = JsonPointer.get(data, pointer);
            for (k in updates) {
              if (!hasProp.call(updates, k)) continue;
              v = updates[k];
              value[k] = v;
            }
            return JsonPointer.set(data, pointer, value, true);
          } catch (error1) {
            error = error1;
          } finally {
            if (error != null) {
              return done(error);
            }
            return _this.writeWithoutLock(sourceKey, data, done);
          }
        };
      })(this));
    };

    FileSystemObjectStore.prototype.update = function() {
      var args, done, i, ref1, sourceKey, work;
      sourceKey = arguments[0], args = 3 <= arguments.length ? slice.call(arguments, 1, i = arguments.length - 1) : (i = 1, []), done = arguments[i++];
      work = (ref1 = this.updateWithoutLock).bind.apply(ref1, [this, sourceKey].concat(slice.call(args)));
      return this.lockManager.get(sourceKey).sync(work, done);
    };

    return FileSystemObjectStore;

  })(ObjectStore);
  JsonFileSystemObjectStore = (function(superClass) {
    extend(JsonFileSystemObjectStore, superClass);

    function JsonFileSystemObjectStore() {
      return JsonFileSystemObjectStore.__super__.constructor.apply(this, arguments);
    }

    JsonFileSystemObjectStore.prototype.getPath = function(sourceKey) {
      return JsonFileSystemObjectStore.__super__.getPath.call(this, sourceKey) + ".json";
    };

    JsonFileSystemObjectStore.prototype.serialize = function(data, done) {
      var error, json;
      try {
        return json = JSON.stringify(data);
      } catch (error1) {
        error = error1;
      } finally {
        if (error != null) {
          return done(error);
        }
        return done(null, json);
      }
    };

    JsonFileSystemObjectStore.prototype.deserialize = function(json, done) {
      var data, error;
      try {
        return data = JSON.parse(json);
      } catch (error1) {
        error = error1;
      } finally {
        if (error != null) {
          return done(error);
        }
        return done(null, data);
      }
    };

    return JsonFileSystemObjectStore;

  })(FileSystemObjectStore);
  MemoryObjectStore = (function(superClass) {
    extend(MemoryObjectStore, superClass);

    function MemoryObjectStore() {
      return MemoryObjectStore.__super__.constructor.apply(this, arguments);
    }

    MemoryObjectStore.prototype.objects = null;

    MemoryObjectStore.prototype.write = function(sourceKey, data, done) {
      this.objects[sourceKey] = data;
      return setImmediate(function() {
        return done();
      });
    };

    MemoryObjectStore.prototype.read = function(sourceKey, done) {
      var data, ref1;
      data = (ref1 = this.objects[sourceKey]) != null ? ref1 : null;
      return setImmediate(function() {
        return done(null, data);
      });
    };

    MemoryObjectStore.prototype.remove = function(sourceKey, done) {
      if (this.objects[sourceKey] != null) {
        delete this.objects[sourceKey];
      }
      return setImmediate(function() {
        return done();
      });
    };

    return MemoryObjectStore;

  })(ObjectStore);
  memory = function(props) {
    return new MemoryObjectStore(props);
  };
  fileSystem = function(props) {
    return new FileSystemObjectStore(props);
  };
  jsonFileSystem = function(props) {
    return new JsonFileSystemObjectStore(props);
  };
  return {
    configure: configure,
    dependencies: dependencies,
    Dependencies: Dependencies,
    Exception: Exception,
    NotImplemented: NotImplemented,
    ObjectStore: ObjectStore,
    ObjectSource: ObjectSource,
    FileSystemObjectStore: FileSystemObjectStore,
    JsonFileSystemObjectStore: JsonFileSystemObjectStore,
    fileSystem: fileSystem,
    jsonFileSystem: jsonFileSystem
  };
};

module.exports = configure();

//# sourceMappingURL=index.js.map
