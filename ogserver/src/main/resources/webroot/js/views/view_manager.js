define(function() {
    return {
        DASHBOARD: "dashboard",
        PRODUCT_LISTING: "productListing",
        PRODUCT_DETAILS: "productDetails",
        USER_PROFILE: "userProfile",
        CONSULT: "consult",
        SHORTLIST: "shortlist",
        STORIES: "stories",
        STORY: "story",
        ABOUT: "about",
        TERMS: "terms",
        PRIVACY_POLICY: "privacy_policy",
        CAREERS: "careers",
        FAQ: "faq",
        MGDIFF: "mgdiff",
        THANKYOU: "thankyou",
        LANDINGPAGE: "landingpage",
        Views: {},
        activeView: "",
        create: function(name, View, options) {
            if (typeof this.Views[name] !== 'undefined') {
                this.Views[name].undelegateEvents();
                this.Views[name].stopListening();
                if (typeof this.Views[name].clean === 'function') {
                    this.Views[name].clean();
                }
            }
            var view = options ? new View(options) : new View();
            this.Views[name] = view;
            this.activeView = name;
            return view;
        }
    };
});