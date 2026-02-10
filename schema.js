const joi = require('joi');

module.exports.listingSchema = joi.object({
    listing:joi.object({
        title:joi.string().required(),
        description:joi.string().required(),
        price:joi.number().min(0).required(),
        location:joi.string().required(),
        country:joi.string().required(),
        image:joi.string().allow(null,""),
        category: joi.string()
      .valid(
        "trending",
        "rooms",
        "cities",
        "mountains",
        "castles",
        "pools",
        "camping",
        "farms",
        "arctic",
        "boats",
        "domes"
      )
      .required(),

    }).required()
});

module.exports.reviewSchema = joi.object({
    review:joi.object({
        rating:joi.number().required().min(1).max(5),
        comment:joi.string().required(),
    }).required(),
});
