/*
Folders uses routes use to Folders and GET resources from the Mongo DB
*/
var FoldersModel = require('./models/FoldersModel');

var FoldersController = {};

// POST API_IP/VERSION/Folders/
// Create a NEW Folder
// AddFolder
FoldersController.AddFolder = function(req, res) {
  var db = req.database;

  // Users can only create Folders for their own account
  var userId = req.user.userId;

  var Folders = {
    userId: userId,
    name: req.body.name,
    cards: req.body.cards || []
  };

  // Force name to fit 8 char limit
  if(typeof Folders.name !== 'undefined')
    Folders.name = Folders.name.substring(0, 8);

  // Execute a query
  var model = new FoldersModel(Folders);
  var promise = model.save();

  promise.then(function(Folders) {
    res.json({data: Folders});
  }, function(err) {
    res.status(500).json({error: err});
  });
}

// GET API_IP/VERSION/Folders/
// Get ALL Folders
// GetFoldersList
FoldersController.GetFoldersList = function(req, res) {  
  var query = FoldersModel.find({userId: req.user.userId});
  var promise = query.exec();

  promise.then(function(Folders) {
    res.json({data: Folders});
  }, function(err) {
    res.status(500).json({error: err});
  });
}

// GET API_IP/VERSION/Folders/:id
// Get a single Folders
// GetFoldersByID
FoldersController.GetFolderByID = function(req, res) {
  folderId = req.params.id;

  var query = FoldersModel.findOne({userId: req.user.userId, _id: folderId});
  var promise = query.exec();

  promise.then(function(Folders) {
    res.json({data: Folders});
  }, function(err) {
    res.status(500).json({error: err});
  });
}

// PUT API_IP/VERSION/Folders/:id
// Update a Folder
// UpdateFolder
FoldersController.UpdateFolder = function(req, res) {
  var query = FoldersModel.findOne({userId: req.user.userId, _id: req.params.id});
  var promise = query.exec();

  promise.then(function(Folders) {
    if(Folders == null) {
      res.status(500).json({error: "No Folder with that ID to update"});
    }

    Folders.name = req.body.name || Folders.name;
    Folders.cards = req.body.cards || Folders.cards;
    return Folders.save();

  }).then(function(Folders){
    res.json({data: Folders});
  }).catch(function(err) {
    res.status(500).json({err});
  });
}

// DELETE API_IP/VERSION/Folders/:id
// Delete a Folder permanently
// DeleteFolder
FoldersController.DeleteFolder = function(req, res) {
  var query = FoldersModel.findOne({userId: req.user.userId, _id: req.params.id});

  var promise = query.exec();
  var name;

  promise.then(function(Folders) {
    name = Folders.name;
    var promiseRemove = Folders.deleOne();
    return promiseRemove.exec();
  }).then(function(){
    res.status(200).json({data: {message: "Folder " + name + " removed"}});
  }).catch(function(err) {
    res.status(500).json({error: err});
  });
}

module.exports = FoldersController;
