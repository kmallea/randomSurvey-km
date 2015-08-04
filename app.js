var mySQLConfig = {
	databaseName : 'survey',
	hostUrl : 'localhost',
	userName : 'root',
	pass : ''
}


var express = require('express'),
	exphbs  = require('express-handlebars'),
	Sequelize = require('sequelize'),
	cookieParser = require('cookie-parser');
	bodyParser = require('body-parser'),
	Admin = require('./libs/Admin');



app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(cookieParser());
app.use(bodyParser.json());

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


var sequelize = new Sequelize(mySQLConfig.databaseName, mySQLConfig.userName, mySQLConfig.pass, {
  host: mySQLConfig.hostUrl,
  dialect: 'mysql',
	pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  define : {
  	timestamps : false
  }
});

//set up the db
var Users = sequelize.define('users',{
	idusers : {type : Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	username : Sequelize.STRING,
	pass : Sequelize.STRING
});

var Questions = sequelize.define('questions',{
	idquestion : {type : Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	question : Sequelize.STRING,
	isanswerd : {type : Sequelize.INTEGER, defaultValue : 0}
});

var QuestionsAnswers = sequelize.define('question_answers',{
	idquestion_answer : {type : Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	answer : Sequelize.STRING,
	idquestion : {type : Sequelize.INTEGER},
	answercount : {type : Sequelize.INTEGER, defaultValue : 0}
});

var Answers = sequelize.define('answers',{
	idanswer : {type : Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	idquestion_answer : {type : Sequelize.INTEGER},
	idquestion : {type : Sequelize.INTEGER}
});


Users.sync()
.then(function(result){
	result.find({
		where : { username : 'admin'}
	})
	.then(function(hasAdmin){
		if(hasAdmin === null){
			result.create({username : 'admin', pass : 'admin'});
		}
	});
	
})
Questions.sync();
QuestionsAnswers.sync();
Answers.sync();

app.get('/', function(req, res){ 
	var list = (typeof req.cookies.answeredQuestion === 'undefined') ? 0 : req.cookies.answeredQuestion;
	Questions.findAll({
		where : ['idquestion NOT IN (' + list + ')'],
		order : sequelize.fn('RAND'),
		limit : '0, 1'
	}).then(function(record){
		if(typeof record[0] !== 'undefined'){
			QuestionsAnswers.findAll({
				where : { idquestion : record[0].dataValues.idquestion}
			}).then(function(qas){
				var data = {},
				choices = [];

				for(var i in qas){
					choices.push(qas[i].dataValues)
				}
				data = {
					question : record[0].dataValues,
					choices : choices
				};
				res.render('home', data);
			})
		}else{
			data = {
				question : null,
				choices : null
			};
			res.render('home', data);
		}
		
	});
	 
});

app.get('/admin', function(req, res){ 
	var data = Admin.init(req.cookies, Questions, QuestionsAnswers);
	
	sequelize.query("SELECT questions.idquestion, questions.question, answer, answercount FROM questions inner join question_answers ON question_answers.idquestion = questions.idquestion GROUP BY question_answers.idquestion_answer", 
		{ type: sequelize.QueryTypes.SELECT})
	.then(function(record){
		// format the results
		if(record.length){
			var lastId = '';
			data.question = [],
			totalRec = record.length;

			for(var i = 0; i < totalRec; i++){
				if(lastId !== record[i].idquestion){
					var question = {
						question : record[i].question,
						answers : []
					}
					lastId = record[i].idquestion;
				}

				question.answers.push(record[i]);

				if(i < totalRec-1){
					if(record[i+1].idquestion !== lastId){
						data.question.push(question);
					}
				}else{
					data.question.push(question);
				}
				
			}
		}
		console.log(data);
		res.render('admin', data);
	});
	 
});

app.post('/login', function(req, res){ 
	
	Users.find({
		where : {
			username : req.body.u,
			pass : req.body.p
		}
	}).then(function(record){
		var result = {success : false, user : null};
		if(record){
			result = {success : true, user : record.dataValues};
		}
		res.send(result);
	});
});

app.post('/addQuestion', function(req, res){ 
	task = Questions.create(req.body)
	.then(function(result){
		var choices = [],
		resultObj = {success : true, result : req.body};
		itemId = result.idquestion;
		for(var i in req.body.choices){
			choices.push({
				idquestion : itemId,
				answer : req.body.choices[i]
			})
		}
		QuestionsAnswers.bulkCreate(choices)
			.then(function(result){
				res.send(resultObj);
			});
	});
});

app.post('/addAnswer', function(req, res){ 
	Answers.create(req.body)
	.then(function(resp){
		Questions.find({
			where : { idquestion : req.body.idquestion }
		})
		.then(function(item){
			var list = req.cookies.answeredQuestion;
			if(typeof list === 'undefined'){
				list = req.body.idquestion;
			}else{
				list = list + ',' + req.body.idquestion;
			}
			res.cookie('answeredQuestion', list);
		    var result = {success : false};

		    //update the count of the answer
		    QuestionsAnswers.find({
		    	where : { idquestion_answer : req.body.idquestion_answer}
		    })
		    .then(function(item){
		    	item.updateAttributes({
			      answercount : item.get('answercount') + 1
			    });
			   if(resp.dataValues){ result = {success : true}; }
				res.send(result); 
		    });
		});
	});
});


var server = app.listen(3000, function(){
	var host = server.address().address,
	port = server.address().port;

	console.log('Listening @ http://%s:%s', host, port);
});