# Survey Junkie

### Pre-Requisites
What you need to have installed already
* [node.js](http://nodejs.org)
* [MySQL](http://www.mysql.com/downloads/)


### Installation
From the command line enter the following commands
```sh
git clone https://github.com/kmallea/randomSurvey-km.git randomSurvey-km
cd randomSurvey-km
npm install
```

### Setup MySQL
Use the following create statement to create the Survey Junkie database on your exisitng MySQL Server.
```sh

CREATE DATABASE `survey` /*!40100 DEFAULT CHARACTER SET latin1 */;

```
### Prepare for first run
Edit you server info in app.js. Lines 2 - 5. 
```sh
var mySQLConfig = {
	databaseName : 'survey',
	hostUrl : 'localhost',
	userName : 'root',
	pass : ''
}
```

### Lets launch the app
```sh
node app.js
```

When the app first loads your tables will be created and a user will be added to the users table with the login/password combo of admin/admin.

To login to the app go to /admin