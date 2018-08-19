var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');

// Mongodb:
//var db = mongo.db(config.connectionString, { native_parser: true });
//db.bind('redirects');

// pwdb: Persistent datastore with automatic loading
var Datastore = require('pwdb');
var db = {};
db.redirects = new Datastore('data/redirects.db');

// You need to load each database (here we do it asynchronously)
db.redirects.loadDatabase();

var service = {};

service.getAll = getAll;
service.getById = getById;
service.getByFrom = getByFrom;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function getAll() {
    var deferred = Q.defer();

    //TODO: update pwDB to accept toArray
    db.redirects.find().toArray(function (err, redirects) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(redirects);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    //TODO: findbyid
    //db.redirects.findById(_id, function (err, redirect) {
    db.redirects.findOne({ _id: _id }, function (err, redirect) {   
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(redirect);
    });

    return deferred.promise;
}

function getByFrom(from) {
    var deferred = Q.defer();

    db.redirects.findOne({
        from: from
    }, function (err, redirect) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(redirect);
    });

    return deferred.promise;
}

function create(redirectParam) {
    var deferred = Q.defer();

    // validate 
    var errors = [];
    if (!redirectParam.from) { errors.push('From is required'); }
    if (!redirectParam.to) { errors.push('To is required'); }

    if (!errors.length) {
        // ensure to and from are lowercase
        redirectParam.from = redirectParam.from.toLowerCase();
        redirectParam.to = redirectParam.to.toLowerCase();

        db.redirects.insert(
            redirectParam,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    } else {
        deferred.reject(errors.join('\r\n'));
    }

    return deferred.promise;
}

function update(_id, redirectParam) {
    var deferred = Q.defer();

    // validate 
    var errors = [];
    if (!redirectParam.from) { errors.push('From is required'); }
    if (!redirectParam.to) { errors.push('To is required'); }

    if (!errors.length) {
        // ensure to and from are lowercase
        redirectParam.from = redirectParam.from.toLowerCase();
        redirectParam.to = redirectParam.to.toLowerCase();

        // fields to update
        var set = _.omit(redirectParam, '_id');

        db.redirects.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    } else {
        deferred.reject(errors.join('\r\n'));
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.redirects.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}