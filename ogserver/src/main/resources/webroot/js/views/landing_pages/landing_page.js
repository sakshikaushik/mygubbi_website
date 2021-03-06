/**
 * Created by mygubbi on 22/2/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'text!/templates/landing_pages/landing_page.html',
    'cloudinary_jquery',
    '/js/mgfirebase.js',
    '/js/consultutil.js',
    '/js/analytics.js'
], function($, _, Backbone, landingPageTemplate, CloudinaryJquery, MGF, ConsultUtil, Analytics) {
    var LandingPageVIew = Backbone.View.extend({
        el: '.page',
        ref: null,
        renderWithUserProfCallback: function(userProfData) {
            $(this.el).html(_.template(landingPageTemplate)({
                'userProfile': userProfData
            }));
            $.cloudinary.responsive();
        },
        render: function() {
            var authData = this.ref.getAuth();
            MGF.getUserProfile(authData, this.renderWithUserProfCallback);
        },
        initialize: function() {
            this.ref = MGF.rootRef;
            Analytics.apply(Analytics.TYPE_GENERAL);
            $.cloudinary.config({ cloud_name: 'mygubbi', api_key: '492523411154281'});
            _.bindAll(this, 'renderWithUserProfCallback');
        },
        submit_form1: function(e) {
            if (e.isDefaultPrevented()) return;
            e.preventDefault();

            var name = $('#contact_full_name1').val();
            var email = $('#contact_email_id1').val();
            var phone = $('#contact_contact_num1').val();

            ConsultUtil.submit(name, email, phone, "", "", null);

            window.App.router.navigate('/thankyou-lp-page', {
                trigger: true
            });

        },
        submit_form2: function(e) {
            if (e.isDefaultPrevented()) return;
            e.preventDefault();

            var name = $('#contact_full_name2').val();
            var email = $('#contact_email_id2').val();
            var phone = $('#contact_contact_num2').val();
            var propertyName = $('#contact_property_name2').val();
            var query = $('#contact_requirement2').val();
            var floorplan = $("#contact_floorplan2").prop('files')[0];

            ConsultUtil.submit(name, email, phone, query, floorplan, propertyName);

            window.App.router.navigate('/thankyou-lp-page', {
                trigger: true
            });

        },
        events: {
            "submit #contactLpForm1": "submit_form1",
            "submit #contactLpForm2": "submit_form2"

        }
    });
    return LandingPageVIew;
});