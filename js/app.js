// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"


import DOM from 'react-dom'
import React, {Component} from 'react'

import $ from 'jquery'
import _ from 'underscore'
import Firebase from 'firebase'
import BackboneFire from 'bbfire'

// console.log("=======jquery=====")
// console.log($)
// console.log("=======underscore=====")
// console.log(_)
// console.log("=======Backbonefire=====")
// console.log(BackboneFire)
// console.log("=======Firebase=====")
// console.log(Firebase)


var rootFbURL = "https://feedgenerations.firebaseio.com/"
var fbRef = new Firebase(rootFbURL)

var UserCollection = BackboneFire.Firebase.Collection.extend({
  url: '', 
  initialize: function(){
  	this.url = fbRef.child('users')
  }
})

var UserRecipeCollection = BackboneFire.Firebase.Collection.extend({
	url: '',
	initialize: function(uid){
		this.url = fbRef.child('users').child(uid).child('recipes')
	}
})

var SingleRecipeModel = BackboneFire.Firebase.Model.extend({
	url: '', 
	initialize: function(uid,recipeId){
		this.url = fbRef.child('users').child(uid).child('recipes').child(recipeId)
	}
})




var RecipeLibraryView = React.createClass({

	getInitialState: function(){
		return {
			userRecipes: []
		}
	}, 

	_goToRecipeView: function(id){
		window.location.hash = "library/" + id 

	},

	_showRecipesJSX: function(mdl){
		if (!mdl.id) return ''

		return(
			<h5>
				<a onClick= {this._goToRecipeView.bind(this, mdl.id)} > {mdl.get("title")} </a>
			</h5>
		)
	},

	componentDidMount: function(){
		var component = this 

		this.props.recipeColl.on("sync", function(){
			console.log(component.props.recipeColl)
			component.setState({
				userRecipes: component.props.recipeColl.models
			})
		})
	}, 

	render: function(){

		var component = this

		return(
			<div>
				<Header />
				<h1>Recipe Library</h1>

				{this.state.userRecipes.map(component._showRecipesJSX)}

			</div>
		)
	}

})

var SingleReceipeView = React.createClass({

	getInitialState: function(){
		return{
			userRecipes: {
					title: "", 
					ingredients: "", 
					instructions: "", 
					equipment: ""}
		}
	},

	_showRecipesJSX: function(mdl){
		if(!mdl.id) return 'no id found'

			return(
				<h5>
					{mdl.get("title","ingredients","instructions","equipment")}
				</h5>
			)
	},

	componentDidMount: function(){
		var component = this
				// model = this.props.recipeMdl;
		console.log('singleRecipeView mounted!', this.props.recipeMdl )
		// 	debugger
		if (this.props.recipeMdl.id){
			this._setRecipeState(this)
		}

		this.props.recipeMdl.on("sync", function(data){
			component._setRecipeState(component)
		// 	// console.log(model)
			//debugger
			console.log('current-recipe --- ', component.props.recipeMdl)
			
		})
	},

	_setRecipeState:function(component){

		component.setState({ 
				userRecipes:{
					title: component.props.recipeMdl.get("title"), 
					ingredients: component.props.recipeMdl.get("ingredients"), 
					instructions: component.props.recipeMdl.get("instructions"), 
					equipment: component.props.recipeMdl.get("equipment")

				}
			})
	},

	render: function(){

		var component = this 

		// debugger;

		return(
			<div>
				<Header />

				<h4>{this.state.userRecipes.title}</h4>
				<h6>Ingredients</h6>
				{this.state.userRecipes.ingredients}
				<h6>Equipment</h6>
				{this.state.userRecipes.equipment}
				<h6>Instructions</h6>
				{this.state.userRecipes.instructions}
				

			</div>
		)
				// {this.props.recipeMdl.get('title')}

	}

})

var HomeView = React.createClass({

	_handleFormSubmit: function(evt){
		evt.preventDefault()

		console.log(evt.target.title.value)
		console.log(evt.target.ingredientsText.value)
		console.log(evt.target.instructionText.value)
		console.log(evt.target.equipmentText.value)

		var userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid)

		userRecipeCollection.create({
			title: evt.target.title.value,
			ingredients: evt.target.ingredientsText.value,
			equipment: evt.target.equipmentText.value,
			instructions: evt.target.instructionText.value

		})

		console.log(userRecipeCollection)

	},

	_handleLogOut: function(){
		fbRef.unauth();
		// MyAppRtr.navigate('login', {trigger: true})
		window.location.hash = 'login'
	},

	_handleLibrary: function(){
		window.location.hash = 'library'
	},

	render:function(){
		return(
			<div>
				<Header />
				<h1>Welcome Home! </h1>
				{/*{fbRef.getAuth().uid}*/}

				<form onSubmit={this._handleFormSubmit}>

					<input type="text" id="title" placeholder="recipe title"/><br/>
					<textarea type="text" id="ingredientsText" placeholder="Enter your ingredients"/><br/>
					<textarea type="text" id="equipmentText" placeholder="Enter your equipments"/><br/>
					<textarea type="text" id="instructionText" placeholder="Enter your instructions"/><br/>

					<input className="button-primary" type="submit" value="submit"/><br/>

				</form>

				<button onClick={this._handleLibrary}>Library</button>

				<button onClick={this._handleFamily}>Family</button><br/>

			</div>
		)
	},

})

var SignUpView = React.createClass({

	_signUp: function(evt){ 	//pasing the evt(clicking of the button)

		evt.preventDefault()	//????

		var emailInput = evt.currentTarget.email.value
		var pwInput = evt.currentTarget.password.value 
		var nameInput = evt.currentTarget.name.value

		var newUser = {
			email: emailInput,
			password: pwInput
		}

		console.log(newUser)
		fbRef.createUser( newUser, function(err, authData){

			var userColl = new UserCollection()

			userColl.create({
				name: nameInput,
				email: emailInput,
				id: authData.uid
				})

			var authDataObj = {
				email: emailInput, 
				password: pwInput
			}

			// authenticate the user  (hint: look at _handleLogin in LoginView) 
			fbRef.authWithPassword(authDataObj, function(err, authData){
				if(err){
					alert("Error in Creating Account. Try Again.")
				}
				else{
					console.log("---signup user authenticated-------------")
					console.log(authData)

					window.location.hash = '' 
				}
			})
		})
	},

	render: function(){
		return (
			<div>
				<form onSubmit={this._signUp}>
					<h3 className="signUp">Sign Up and Cook with your History</h3>

					<input type="text" id="name" placeholder="Name" /><br/>
					<input type="text" id="email" placeholder="Email" /><br/>
					<input type="text" id="password" placeholder="Password" /><br/>
					<input className="button-primary" type="submit" defaultValue="Log In" /><br/> 

				</form>	
			</div>
		)
	}

})

var LoginView = React.createClass({

	_handleLogin: function(evt){
		evt.preventDefault()

		var emailInput = evt.currentTarget.email.value 
		var pwInput = evt.currentTarget.password.value

		var authDataObj = {
			email: emailInput,
			password: pwInput
		}

		fbRef.authWithPassword(authDataObj, function(err, authData){
			if(err){
				alert("Your Username or Password is Incorrect! Try again.")
			}
			else{
				console.log("---login user authenticated---------")
				console.log(authData)
				window.location.hash = ''
			}
		})
	}, 

	render: function(){
		return(
			<div>
				<form onSubmit={this._handleLogin}>
					<h3 className="loginIn">Log In</h3>

					<input type="text" id="email" placeholder="email"/><br/>
					<input type="text" id="password" placeholder="password"/><br/>
					<input className="button-primary" type="submit" defaultValue="Log In"/><br/>

				</form>
			</div>
		)
	}

})

var Header = React.createClass({

		_handleLogOut: function(){
		fbRef.unauth();
		// MyAppRtr.navigate('login', {trigger: true})
		window.location.hash = 'login'
	},

	render: function(){
		return(
			<div className="headerContainer">
				<h1 className="title">Feed Generations</h1>
				<button onClick={this._handleLogOut}>Log Out</button>
			</div>
		)
	}

})

var AppRouter = BackboneFire.Router.extend({
	routes: {
		"signup"	         : "showSignUpView",
		"login"		         : "showLoginView",
		"library/:recipeId": "showSingleRecipe",
		"library"          : "showRecipeLibrary",
		"*def"             : "showHome"	

		// "library" : "libraryView",
		// "family"	:	"familyView",

	}, 

	showSignUpView: function(){

		console.log("from authView")

		DOM.render( <SignUpView />, document.querySelector('.container') )

	},

	showLoginView: function(){

		console.log("from LoginView")

		DOM.render( <LoginView />, document.querySelector('.container') )

	},

	showHome: function(){

		console.log("from HomeView")

		DOM.render( <HomeView/>, document.querySelector('.container') )

	},
	
	showRecipeLibrary: function(){

		console.log("from RecipeLibraryView")

		var userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid )

		DOM.render( <RecipeLibraryView recipeColl={userRecipeCollection}/>, document.querySelector('.container') )
	},

	showSingleRecipe: function(recipeId){

		console.log("from SingleReceipeView")
		// console.log(singleRecipeModel)
		console.log(fbRef.getAuth().id)
		console.log(fbRef.getAuth())

		var singleRecipeModel_inst = new SingleRecipeModel( fbRef.getAuth().uid, recipeId)

		// DOM.render( <SingleReceipeView userRecipes{'ingredients',}/>, document.querySelector('.container') )
    // singleRecipeModel_inst.on("sync", function(data){
		DOM.render( <SingleReceipeView recipeMdl={singleRecipeModel_inst}/>, document.querySelector('.container') )
		// })
	},

	initialize: function(){

		console.log(window.location.hash)
		if(!fbRef.getAuth() && window.location.hash!== '#signup'){
			location.hash = "login"
		}

		this.on('route', function(){
			if(!fbRef.getAuth() && window.location.hash!== "#signup"){
				location.hash = "login"
			}
		})


		BackboneFire.history.start()

	}

})





var MyAppRtr = new AppRouter()

// Create login u.i. functionality
// 
// 1) create the route 'recipe-library' + callbackName "showRecipeLibrary"
// 2) create the route method (showRecipeLibrary)
// 3) create the React component RecipeLibraryView
// 4) DOm.render ^^ dummy-html

// 5) inside showRecipeLibrary, create a new instance of UserRecipeCollection and 
//    console.log the users recipes

// 6) when user clicks 'Library' button from HomeView --> route them to 'recipe-library'

