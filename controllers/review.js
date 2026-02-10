const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    // console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created!");
    // console.log("New Reivew Saved");
    res.redirect(`/listings/${listing._id}`);

};

module.exports.destroyReview = async(req,res,next)=>{
    let {id,reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId); // Deleting the reivew from the review collection
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};