$(document).ready(function(){
	appCtrl.init();
});

appCtrl = {
	opts : {
		thisContainer : 'body',
		userNameField : '#user_name',
		passwordField : '#password',
		actionBtn : '.action-btn',
		newQuestionObj : '#new-question',
		newQuestButton : '.new-quest-btn',
		addQuestionField : '#question',
		addChoiceFieldPrefix : '#choice-',
		answerRadioGroup : 'group1',
		maxChoices : 6,
		msgs : {
			missingFields : 'Uh Oh! Username & Password are required.',
			invalidLogin : 'Ooops, that wasn\'t right.',
			improperQuestion : '1 question, 2 choices required.',
			errorAddingQuestion : 'An error occured.',
			surveySuccess : 'Your answer was added successfully',
			surveyFail : 'Uh Oh! Something went wrong.',
		}

	},

	init : function(){
		var thisPage = window.location.pathname.substr(window.location.pathname.indexOf('/')+1, window.location.pathname.length).toUpperCase();
		$(this.opts.thisContainer).on('click', this.opts.actionBtn, appCtrl.actionHandler);
	},

	//classes that maths opts.actionBtn get handled here.
	//they need a data-action attr with a value that === a function defined in this app
	actionHandler : function(e){
		if(e){ e.preventDefault(); }
		var action = $(this).data('action');
		appCtrl[action].call(this,e);
	},

	//add a new choice option to display
	//loops through predefined items and see who is still hidden and unhides
	addChoice : function(){
		for(var i = 1; i < appCtrl.opts.maxChoices; i++){
			$obj = $(appCtrl.opts.addChoiceFieldPrefix + i).parent();
			if($obj.hasClass('hide')){
				$obj.removeClass('hide');
				i = appCtrl.opts.maxChoices + 1;
			}
		}
	},

	//shows the add question form and clears it out.
	//opts.newQuestionObj is the wrapper
	newQuestion : function(){
		if(!$(this).hasClass('disabled')){
			$(appCtrl.opts.addQuestionField).val('');
			for(var i = 1; i < appCtrl.opts.maxChoices; i++){
				$obj = $(appCtrl.opts.addChoiceFieldPrefix + i).parent();
				$(appCtrl.opts.addChoiceFieldPrefix + i).val('');
				if(i > 2){
					if(!$obj.hasClass('hide')){
						$obj.addClass('hide');
					}
				}
			}
			$(appCtrl.opts.newQuestionObj).removeClass('hide');
			$(this).addClass('disabled')
		}
	},

	//checks newQuestion form for correct values to submit
	saveQuestion : function(){
		console.log('SAVE QUESTION');
		//must be a question and 2 answers
		var choices = [];
		for(var i = 1; i < appCtrl.opts.maxChoices; i++){
			var choiceVal = $.trim($(appCtrl.opts.addChoiceFieldPrefix + i).val());
			if(choiceVal !== '' && !$(appCtrl.opts.addChoiceFieldPrefix + i).hasClass('hide')){
				choices.push(choiceVal);
			}
		}
		var data = {
			question : $.trim($(appCtrl.opts.addQuestionField).val()),
			choices : choices
		}
		if(data.question.length >= 3 && choices.length >= 2){
			appCtrl.ajaxPost('/addQuestion', data, appCtrl.onQuestionSuccess, appCtrl.onAjaxError);
		}else{
			Materialize.toast(appCtrl.opts.msgs.improperQuestion, 4000);
		}
		console.log(data);
	},

	// after adding a question was it success or not
	onQuestionSuccess : function(d){
		if(d.success){
			Materialize.toast('Question added', 2000);
			$(appCtrl.opts.newQuestionObj).addClass('hide');
			$(appCtrl.opts.newQuestButton).removeClass('disabled');
			setTimeout(function(){ window.location.reload(); },2000);
		}else{
			Materialize.toast(appCtrl.opts.msgs.errorAddingQuestion, 2000);
		}
	},

	cancelAdd : function(){
		$(appCtrl.opts.newQuestionObj).addClass('hide');
		$(appCtrl.opts.newQuestButton).removeClass('disabled');
	},

	// when the user answers a question
	markAnswer : function(e){
		if(e){ e.preventDefault(); }
		var data = {
			idquestion : $(this).data('id'),
			idquestion_answer : $('input[name='+ appCtrl.opts.answerRadioGroup +']:checked').val()
		}
		appCtrl.ajaxPost('/addAnswer', data, appCtrl.onAnswerSuccess, appCtrl.onAjaxError);
	},

	onAnswerSuccess : function(d){
		if(d.success){
			Materialize.toast(appCtrl.opts.msgs.surveySuccess, 5000);
			setTimeout(function(){ window.location.reload(); },2000);
		}else{
			Materialize.toast(appCtrl.opts.msgs.surveyFail, 5000);
		}
	},

	processLogin : function(e){
		if(e){ e.preventDefault(); }
		var user = $.trim($(appCtrl.opts.userNameField).val()),
		pass = $.trim($(appCtrl.opts.passwordField).val());
		
		if(user.length > 2 && pass.length > 2){
			var data = { u : user, p : pass };
			appCtrl.ajaxPost('/login', data, appCtrl.onLoginSuccess, appCtrl.onAjaxError);
		}else{
			Materialize.toast(appCtrl.opts.msgs.missingFields, 2000);
		}	
	},

	onLoginSuccess : function(d){ 
		if(d.success){
			appCtrl.utils.setCookie('user', d.user.username, 1);
			Materialize.toast('Welcome, ' + d.user.username, 2000);
			setTimeout(function(){ window.location.reload(); },2000);
		}else{
			Materialize.toast(appCtrl.opts.msgs.invalidLogin, 2000);
		}
	},

	onAjaxError : function(){},

	ajaxPost : function(url, data, onSuccess, onError){
		$.ajax({
			url : url,
			method : 'post',
			data : JSON.stringify(data),
			contentType: 'application/json',
			dataType: 'json',
			success : onSuccess,
			error : onError
		});
	},
	utils : {
		getCookie : function(c_name){
			var i,x,y,ARRcookies=document.cookie.split(";");
			for (i=0;i<ARRcookies.length;i++){
				x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
				y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
				x=x.replace(/^\s+|\s+$/g,"");
				if (x==c_name){ return unescape(y); }
			}
		},
		setCookie : function(cookieName,cookieValue,nDays) {
			var today = new Date();
			var expire = new Date();
			if (nDays===null || nDays===0) nDays=1;
			expire.setTime(today.getTime() + 3600000*24*nDays);
			document.cookie = cookieName+"="+escape(cookieValue)+ ";expires="+expire.toGMTString();
		},
		deleteCookie : function(name){
			document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		},
	}
}