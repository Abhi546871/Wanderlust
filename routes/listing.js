const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const {isLoggedIn,isOwner,validateListing} = require('../middleware.js');
const listingController = require('../controllers/listing.js');
const multer = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage});

router.route('/')
//Index Route
.get( wrapAsync(listingController.index))
// Post new Listing Route
.post(
    isLoggedIn,
    validateListing,
    upload.single('listing[image]'),
    wrapAsync(listingController.createListing),
    
);

router.get('/search/suggestions', listingController.searchSuggestions);


//Get New Listing Route
router.get("/new",isLoggedIn, listingController.renderNewListing);

router.route('/:id')
//Update new review route
.put(isLoggedIn, isOwner,upload.single('listing[image]'),validateListing, wrapAsync(listingController.updateListing))
//Delete Listing Route
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing))
//Show Listing Route
.get( wrapAsync(listingController.showListing))

//Category Route
router.get('/category/:category',isLoggedIn,listingController.renderCategoryListing);


//Get Edit Listing Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;