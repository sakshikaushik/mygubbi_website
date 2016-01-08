define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'bootstrapvalidator',
    'mgfirebase'
], function($, _, Backbone, Bootstrap, BootstrapValidator, MGF) {
    return {
        ref: MGF.rootRef,

        createUser: function(userId, data, cbk) {
            var that = this;
            this.ref.child("users").child(userId).set(data, function(error) {
                if (error) {
                    console.log("Data could not be saved." + error);
                    that.cbk(false);
                } else {
                    console.log("Data saved successfully.");
                    that.cbk(true);
                }
            });
        },

        setUser: function(user) {
            users.add(user, {
                at: 0
            });
        },

        getUserProfile: function(uid, authData, handleAuth) {
            var userProfileRef = this.ref.child("user-profiles/" + uid);
            var userProfile = null;
            var that = this;
            userProfileRef.once("value", function(snapshot) {
                if (snapshot.exists()) {
                    userProfile = snapshot.val();
                }
                that.handleAuth(authData, userProfile);
                console.log("handleAuth done");
            });
        },
        getUserProfileWithCB: function(fx) {
            var authData = this.ref.getAuth();
            MGF.getUserProfile(authData, fx);
        },
        onFAuth: function(authData) {
            if (authData && authData.provider !== 'anonymous') { //don't do nothin on anonymous auths
                $('#user-icon').toggleClass("glyphicon glyphicon-user fa fa-spinner fa-spin");
                if (users.length === 0 || users.at(0).get('uid') !== authData.uid) {
                    this.getUserProfile(authData.uid, authData, this.handleAuth);
                    console.log("user profile done");
                }
            }
        },

        handleAuth: function(authData, userProfile) {
            var email = this.getEmail(authData);

            if (!email) {
                console.log("email not provided, please try again and provide email id as it is mandatory.");
                $('#login_error').html("Please tick email, while providing Facebook access.");
                $('#login_error_row').css("display", "block");
                this.ref.unauth();
                return;
            }


            var user = {
                provider: authData.provider,
                email: this.getEmail(authData),
                displayName: this.getName(authData, userProfile),
                profileImage: this.getImage(authData, userProfile),
                uid: authData.uid
            };

            if (authData.provider !== 'password') {
                var userRef = this.ref.child("users/" + authData.uid);
                var that = this;
                userRef.once("value", function(snapshot) {
                    if (snapshot.exists()) {
                        that.setUser(user);
                        console.log("user already exists in firebase");
                        window.fbButton && window.fbButton.button('reset');
                        window.googleButton && window.googleButton.button('reset');
                        $('#user-icon').toggleClass("glyphicon glyphicon-user fa fa-spinner fa-spin");
                    } else {
                        console.log("user doesn't exist in firebase, creating..");

                        var cbk = function(result) {
                            if (result) {
                                that.setUser(user);
                                that.createProfile(authData, {
                                    displayName: user.displayName,
                                    email: user.email,
                                    phone: '',
                                    profileImage: user.profileImage
                                }, null);
                            }
                            window.fbButton && window.fbButton.button('reset');
                            window.googleButton && window.googleButton.button('reset');
                            $('#user-icon').toggleClass("glyphicon glyphicon-user fa fa-spinner fa-spin");
                        };
                        that.createUser(authData.uid, user, cbk);
                    }
                });
            } else {
                this.setUser(user);
                $('#user-icon').toggleClass("glyphicon glyphicon-user fa fa-spinner fa-spin");
            }
        },

        authHandler: function(error, authData) {
            if (error) {
                console.log("Login Failed!", error);
                $('#login_error').html(error);
                $('#login_error_row').css("display", "block");
            } else {
                console.log("Authenticated successfully");
            }
            window.loginButton && window.loginButton.button('reset');
            window.googleButton && window.googleButton.button('reset');
            window.fbButton && window.fbButton.button('reset');
        },

        pwdLogin: function() {
            this.ref.authWithPassword({
                email: $('#emailId').val(),
                password: $('#pwd').val()
            }, this.authHandler, {
                remember: $('#remember').is(':checked') ? 'default' : 'sessionOnly'
            });
        },

        resetPassword: function() {
            this.ref.resetPassword({
                email: $('#forgotEmail').val()
            }, function(error) {
                if (error) {
                    console.log("Reset Failed!", error);
                    $('.modal_error_msg').slideDown();
                } else {
                    console.log("reset successfully");
                    $('.modal_success_msg').slideDown();
                    $('#forgotBtn').hide();
                    $('#forgotEmail').prop('disabled', true);
                }
                window.forgotButton && window.forgotButton.button('reset');
            });
        },

        signOut: function(ev) {
            this.ref.unauth();
            users.reset();
        },

        getName: function(authData, userProfile) {
            if (userProfile) {
                return userProfile.displayName;
            } else {
                switch (authData.provider) {
                    case 'password':
                        return authData.password.email.replace(/@.*/, '');
                    case 'google':
                        return authData.google.displayName;
                    case 'facebook':
                        return authData.facebook.displayName;
                }
            }
        },

        getImage: function(authData, userProfile) {
            if (userProfile) {
                return userProfile.profileImage;
            } else {
                switch (authData.provider) {
                    case 'password':
                        return authData.password.profileImageURL;
                    case 'google':
                        return authData.google.profileImageURL;
                    case 'facebook':
                        return authData.facebook.profileImageURL;
                }
            }
        },

        getEmail: function(authData) {
            switch (authData.provider) {
                case 'password':
                    return authData.password.email;
                case 'google':
                    return authData.google.email;
                case 'facebook':
                    return authData.facebook.email;
            }
        },

        closeModal: function(ev) {
            var id = $(ev.currentTarget).data('element');
            $(id).modal('toggle');
        },

        closePopup: function(ev) {
            var id = $(ev.currentTarget).data('element');
            if (id == '.userpop') {
                $('.userpop').css('right', '-800px');
            } else {
                $(id).hide('slow');
            }
        },

        contactUsSubmit: function() {
            window.contactusSubmitButton && window.contactusSubmitButton.button('reset');
            var formData = {
                "fullName": $('#contact_full_name').val(),
                "email": $('#contact_email_id').val(),
                "contactNumber": $('#contact_contact_num').val(),
                "requirements": $('#contact_requirement').val(),
                "propertyName": $('#contact_property_name').val()
            };

            var authData = this.ref.getAuth();
            var that = this;
            if (!authData) {
                this.ref.authAnonymously(function(error, authData) {
                    if (error) {
                        console.log("Login Failed!", error);
                    } else {
                        that.setConsultData(authData, formData);
                    }
                });
            } else {
                this.setConsultData(authData, formData);
            }

            $('#contactForm').hide('slow');
            $('#success-msg').show('slow');
            $('#success-msg-padding').show('slow');

        },

        closeContactForm: function(ev) {
            $('#contactuspop').modal('toggle');
        },

        signUp: function() {

            var that = this;
            this.ref.createUser({
                email: $('#reg_email_id').val(),
                password: $('#reg_password').val()
            }, function(error, userData) {
                if (error) {
                    console.log("Error creating user:", error);
                    $('#reg_error').html(error);
                    $('#reg_error_row').css("display", "block");
                    window.signupButton.button('reset');
                } else {
                    console.log("Successfully created user account with uid:", userData.uid);
                    that.ref.offAuth(that.onFAuth);
                    that.ref.authWithPassword({
                        email: $('#reg_email_id').val(),
                        password: $('#reg_password').val()
                    }, function(error, authData) {

                        var profileData = {
                            displayName: $('#reg_full_name').val(),
                            email: $('#reg_email_id').val(),
                            phone: $('#reg_contact_num').val(),
                            profileImage: authData.password.profileImageURL
                        };

                        var callbk = function() {
                            that.ref.unauth();
                            window.signupButton.button('reset');
                            $('#reg_done_message').html("Thanks for registering with us. You now have access to our personalized service. Please <a href='#' onclick='gotoLogin();'>Login</a> to proceed.");
                            $('#signup').modal('toggle');
                            $('#notify').modal('show');
                            that.ref.onAuth(that.onFAuth);
                        };

                        that.createProfile(userData, profileData, callbk);

                    });
                }
            });

            return false;
        },

        gotoLogin: function() {
            $('#notify').modal('toggle');
            this.showUserPop();
        },

        showUserPop: function() {
            $('#login_error').html('');
            $('#login_error_row').css("display", "none");
            $('.userpop').css('right', '0px');
        },

        createProfile: function(userData, profileData, cbk) {
            this.ref.child('user-profiles').child(userData.uid).set(
                profileData,
                function(error) {
                    if (error) {
                        console.log("password profile data could not be saved." + error);
                    } else {
                        console.log("data saved successfully.");
                    }
                    if (cbk) cbk();
                }
            );
        },
        setConsultData: function(authData, formData) {
            this.ref.child("consults/" + authData.uid + "/" + Date.now()).set(formData,
                function(error) {
                    if (error) {
                        console.log("problem in inserting consult data", error);
                    } else {
                        console.log("successfully inserted consult data");
                    }
                });
        },
        ready: function(parent) {

            //add any new functions to this list. This is essential as this class is only a helper, the functions are called from outside.
            _.bindAll(this, 'closeContactForm', 'setConsultData', 'createUser', 'setUser', 'getUserProfile', 'onFAuth', 'handleAuth', 'authHandler', 'pwdLogin', 'resetPassword', 'signOut', 'getName', 'getImage', 'getEmail', 'closeModal', 'closePopup', 'contactUsSubmit', 'signUp', 'gotoLogin', 'showUserPop', 'createProfile');

            var events = {
                "click .signout_icon": this.signOut,
                "click #close-user-pop": this.closePopup,
                "click #close-signup-pop": this.closeModal,
                "click #close-forgot-pop": this.closeModal,
                "click #close-contactus-pop": this.closeModal,
                "click #contact-form-explore": this.closeContactForm
            };

            parent.delegateEvents(events);

            this.ref.onAuth(this.onFAuth);
            var that = this;

            $(function() {

                $('.user').click(function() {
                    that.showUserPop();
                });

                $('#new_reg').click(function() {
                    $('.userpop').css('right', '-800px');
                    $('#signup').modal('toggle');
                    $('#reg_error').html('');
                    $('#reg_error_row').css("display", "none");
                    $('#reg_password').val('');
                    $('#reg_confirm').val('');

                });

                $('#contact-us-side-btn').click(function() {
                    $('#contactuspop').modal('toggle');
                    $('#contact_error').html('');
                    $('#contact_error_row').css("display", 'none');
                });

                $("#contactForm").submit(function(e) {
                    if (e.isDefaultPrevented()) return;
                    e.preventDefault();
                    window.contactusSubmitButton.button('loading');
                    $('#contact_error').html('');
                    $('#contact_error_row').css("display", "none");
                    that.contactUsSubmit();
                });

                $("#registerForm").submit(function(e) {
                    e.preventDefault();
                    if ($('#reg_confirm').val() !== $('#reg_password').val()) {
                        $('#reg_confirm_error').html("Passwords don't match!");
                    } else {
                        window.signupButton.button('loading');
                        $('#reg_confirm_error').html('');
                        $('#reg_error').html('');
                        $('#reg_error_row').css("display", "none");
                        that.signUp();
                    }
                });

                $('#loginBtn').click(function() {
                    window.loginButton = $(this);
                });

                $('#forgotBtn').click(function() {
                    window.forgotButton = $(this);
                });

                $('#signup-btn').click(function() {
                    window.signupButton = $(this);
                });

                $('#contactus-submit-btn').click(function() {
                    window.contactusSubmitButton = $(this);
                });

                $("#loginForm").submit(function(e) {
                    e.preventDefault();
                    window.loginButton.button('loading');
                    $('#login_error').html('');
                    $('#login_error_row').css("display", "none");
                    that.pwdLogin();
                });

                $("#forgotForm").submit(function(e) {
                    e.preventDefault();
                    window.forgotButton.button('loading');
                    $('.modal_success_msg').css('display', 'none');
                    $('.modal_error_msg').css('display', 'none');
                    that.resetPassword();
                });

                $('#view_profile').click(function() {
                    $('.userpop').css('right', '-800px');
                });

                $('.search').click(function() {
                    $('.search_overlay').slideDown();
                    $('.search_input').focus();
                });

                $('.search_close').click(function() {
                    $('.search_overlay').slideUp();
                });

                $('.search_input').keyup(function() {
                    var char = $(this).val().length;
                    if (char >= 3) {
                        $('.search_suggest').slideDown();
                    } else {
                        $('.search_suggest').slideUp();
                    }
                });

                $('.search_overlay').click(function() {
                    $('.search_input').focus();
                    $('.search_suggest').slideUp();
                });

                $("#forgot_password").on('hidden.bs.modal', function() {
                    $('.modal_success_msg').css('display', 'none');
                    $('.modal_error_msg').css('display', 'none');
                });

                $("#forgot_pwd_btn").click(function() {
                    $('#forgot_password').modal('show');
                    $('#forgotBtn').show();
                    $('#forgotEmail').val('');
                    $('#forgotEmail').prop('disabled', false);

                });

                $('#fb-btn').click(function() {
                    window.fbButton = $(this);
                    window.fbButton.button('loading');
                    that.ref.authWithOAuthPopup("facebook", that.authHandler, {
                        scope: "email"
                    });
                });

                $('#google-btn').click(function() {
                    window.googleButton = $(this);
                    window.googleButton.button('loading');
                    that.ref.authWithOAuthPopup("google", that.authHandler, {
                        scope: "email"
                    });
                });


                $(window).scroll(function() {
                    var duration = 500;
                    if ($(this).scrollTop() > 200) {
                        $('#tawkchat-iframe-container').fadeIn(duration);
                    } else {
                        $('#tawkchat-iframe-container').fadeOut(duration);
                    }
                });

                $(function() {
                    var navMain = $("#bs-example-navbar-collapse-1");
                    var subMenuUL = $(".dropdown-menu");
                    subMenuUL.on("click", "a", null, function() {
                        navMain.collapse('hide');
                    });
                });

                $('#tawkchat-iframe-container').hide();

            });
        }
    };
});