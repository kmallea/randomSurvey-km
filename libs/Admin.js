module.exports = Admin = (function(){
	var options = {
		userField : '#user_name',
		passField : '#password'

	},

	settings = {
		db : null,
		users : null,
		defs : null
	},

	pub = {
		init : function(cookies, q, a){
			var isLoggedIn = (typeof cookies.user !== 'undefined') ? true : false,
			username = (typeof cookies.user !== 'undefined') ? cookies.user : null;

			if(!username){
				console.log(a);
			}

			var data = {
				isLoggedIn : isLoggedIn,
				name : username
			}
			return data;
		}
	},

	priv = {

	}


	return pub;
})();

