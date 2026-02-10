const Listing = require('../models/listing');

async function getCoordinates(address) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
    )}&format=geojson&limit=1`;

    const res = await fetch(url, {
        headers: {
            "User-Agent": "WanderLust/1.0 (contact: abhinavmarasakatla@gmail.com)",
            "Accept": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch location data");
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Geocoding service returned non-JSON response");
    }

    const data = await res.json();

    if (!data.features || data.features.length === 0) {
        throw new Error("Invalid location");
    }

    return data.features[0].geometry;
}


module.exports.index = async (req, res) => {
    // let data = await Listing.find({});
    // res.render("listings/index.ejs", { listings: data });

    const { location, country, category, q } = req.query;

    const query = {};

    if (location) {
        query.location = new RegExp(`^${location}$`, "i");
    }

    if (country) {
        query.country = new RegExp(`^${country}$`, "i");
    }

    if (category) {
        query.category = new RegExp(`^${category}$`, "i");
    }

    // optional global search fallback
    if (q) {
        const regex = new RegExp(q, "i");
        query.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
            { category: regex }
        ];
    }

    const listings = await Listing.find(query);
    res.render("listings/index.ejs", { listings });
};

module.exports.renderNewListing = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate('owner');
    // console.log(listing);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect('/listings');
    }
    res.render("listings/show.ejs", { listing: listing });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect('/listings');
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace('/upload', '/upload/h_300,w_250');

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.createListing = async (req, res, next) => {

        try {
            const coordinates = await getCoordinates(req.body.listing.location);

            const newListing = new Listing(req.body.listing);
            newListing.owner = req.user._id;
            newListing.geometry = coordinates;

            if (req.file) {
                newListing.image = {
                    url: req.file.path,
                    filename: req.file.filename
                };
            }

            await newListing.save();
            req.flash("success", "New Listing Created!");
            res.redirect("/listings");
        } catch (err) {
            req.flash("error", err.message || "Invalid location");
            res.redirect("/listings/new");
        }
};



module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const newData = req.body.listing;
    let listing = await Listing.findByIdAndUpdate(id, newData, { runValidators: true });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

module.exports.renderCategoryListing = async (req, res) => {
    let { category } = req.params;
    let listings = await Listing.find({ category });
    if (listings.length == 0) {
        req.flash("error", "Listings with this category aren't available");
        return res.redirect('/listings');
    }
    res.render('listings/category.ejs', { listings, category });
}

module.exports.searchSuggestions = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");

    const listings = await Listing.find(
        {
            $or: [
                { title: regex },
                { location: regex },
                { country: regex },
                { category: regex }
            ]
        },
        {
            title: 1,
            location: 1,
            country: 1,
            category: 1
        }
    ).limit(10);

    res.json(listings);
}