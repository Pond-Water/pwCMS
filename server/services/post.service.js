var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var slugify = require('server/helpers/slugify');

// pwdb way: Persistent datastore with automatic loading
var Datastore = require('pwdb');
var db = {};
db.posts = new Datastore('data/posts.db');

// You need to load each database (here we do it asynchronously)
db.posts.loadDatabase();

var service = {};

service.getAll = getAll;
service.getByUrl = getByUrl;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function getAll() {
    var deferred = Q.defer();

    //TODO: update pwDB to accept toArray
    //db.posts.find().sort({ publishDate: -1 }).toArray(function (err, posts) {
    db.posts.find().sort({ publishDate: -1 }).exec(function (err, posts) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(posts);
    });

    return deferred.promise;
}

function getByUrl(year, month, day, slug) {
    var deferred = Q.defer();

    db.posts.findOne({
        publishDate: year + '-' + month + '-' + day,
        slug: slug
    }, function (err, post) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(post);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    //TODO: pwDB review if add findById
    //db.posts.findById(_id, function (err, post) {
    db.posts.findOne({ _id: _id }, function (err, post) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(post);
    });

    return deferred.promise;
}

function create(postParam) {
    var deferred = Q.defer();

    // generate slug from title if empty
    postParam.slug = postParam.slug || slugify(postParam.title);

    db.posts.insert(
        postParam,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function update(_id, postParam) {
    var deferred = Q.defer();

    // generate slug from title if empty
    postParam.slug = postParam.slug || slugify(postParam.title);

    // fields to update
    var set = _.omit(postParam, '_id');

    db.posts.update(
        { _id: _id },
        { $set: set },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.posts.remove(
        { _id: _id },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}