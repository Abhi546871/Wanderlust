const express = require('express');
const router = express.Router({mergeParams:true});
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware.js');
const wrapAsync = require('../utils/wrapAsync.js');
const reviewController = require('../controllers/review.js');



//Post new Review Route
router.post('/', isLoggedIn,validateReview ,wrapAsync(reviewController.createReview));

// Deleting a reivew from listing
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;