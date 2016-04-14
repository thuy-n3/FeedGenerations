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
	initialize: function(uid , query){
		if (query !=undefined)	{	
			this.url = fbRef.child('users').child(uid).child('recipes').orderByChild('title').equalTo(query)
			console.log('url',this.url)
		}
		else{
			this.url = fbRef.child('users').child(uid).child('recipes')
		}
	}
})

var SingleRecipeModel = BackboneFire.Firebase.Model.extend({
	url: '', 
	initialize: function(uid,recipeId, ){
		this.url = fbRef.child('users').child(uid).child('recipes').child(recipeId)
		
	}
})




var RecipeLibraryView = React.createClass({

	getInitialState: function(){
		return {
			// userRecipes: [],
			ready:false

		}
	}, 

	_goToRecipeView: function(id){
		window.location.hash = "library/" + id 

	},

	_showRecipesJSX: function(mdl){
		if (!mdl.id) return ''

		return(
			<h5>
				<img className="libraryViewPicture" src={mdl.get("picture")} onClick= {this._goToRecipeView.bind(this, mdl.id)} /> 
				<p onClick= {this._goToRecipeView.bind(this, mdl.id)} > {mdl.get("title")} </p>
			</h5>
		)
	},

// _handleSearchSubmit: function(){
// 	evt.preventDefault()

// },

	componentDidMount: function(){
		var component = this 

		this.props.recipeColl.on("sync", function(){
// alert()
			console.log(component.props.recipeColl)
			component.setState({
				ready:true
				// userRecipes: component.props.recipeColl.models
			})
		})
	}, 

	render: function(){

		var component = this
		return(
			<div>
				<Header />
				<NavBar />
				<SearchLibary />
				<h1>Recipe Library</h1>

			{/*	<form onSubmit={this._handleSearchSubmit}>
								<input type='text' id="searchlibrary" placeholder='search library' />
								<input className='button-primary' type='submit' value='submit' />
			
			
							</form>*/}


				{this.props.recipeColl.models.map(component._showRecipesJSX)}

			</div>
		)
	}

})

var SingleReceipeView = React.createClass({

	getInitialState: function(){
		return{
			userRecipes: {
					picture: "",
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
					{mdl.get("picture","title","ingredients","instructions","equipment")}
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
					picture: component.props.recipeMdl.get("picture"),
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
				<NavBar />

				<img className="SingleViewPicture" src={this.state.userRecipes.picture} />
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

	getInitialState: function(){
		return({
			imageFileData: ""
			}	
		)
	},

	
	_handleFormSubmit: function(evt){
		evt.preventDefault()

		//console.log(this.state.imageFileData)

		console.log(this.state.imageFileData)	//is there another way to console.log to tell that img has upload?
		console.log(evt.target.title.value)
		console.log(evt.target.ingredientsText.value)
		console.log(evt.target.instructionText.value)
		console.log(evt.target.equipmentText.value)

		var userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid)

		userRecipeCollection.create({
			// picture: evt.target.featureImage.imageFileData,

			picture: this.state.imageFileData,
			title: evt.target.title.value,
			ingredients: evt.target.ingredientsText.value,
			equipment: evt.target.equipmentText.value,
			instructions: evt.target.instructionText.value

		})

		console.log(userRecipeCollection)

	},

	// _handleLogOut: function(){
	// 	fbRef.unauth();
	// 	// MyAppRtr.navigate('login', {trigger: true})
	// 	window.location.hash = 'login'
	// },

	// _handleLibrary: function(){
	// 	window.location.hash = 'library'
	// },

	_handlePicture: function(evt){
		var component = this

		console.log(evt.target.files[0])
		var fileReader = new FileReader()

		fileReader.readAsDataURL(evt.target.files[0]);

		fileReader.addEventListener("load", function() {
    		component.setState({
    			imageFileData: fileReader.result
    		})
    		// console.log(fileReader.result);

  	
  		}, 
  		// false
  		);

	},


	render:function(){
		return(
			<div>
				<Header />
				<NavBar />
				<h1>Welcome Home! </h1>
				{/*{fbRef.getAuth().uid}*/}


				<form onSubmit={this._handleFormSubmit}>

					<input type="file" id="featureImage" onChange={this._handlePicture}/><br/>
					<img src={this.state.imageFileData}/> {/*--this.state.imageFileData is the selected image file from _handlePicture*/}	


					<input type="text" id="title" placeholder="recipe title"/><br/>
					<textarea type="text" id="ingredientsText" placeholder="Enter your ingredients"/><br/>
					<textarea type="text" id="equipmentText" placeholder="Enter your equipments"/><br/>
					<textarea type="text" id="instructionText" placeholder="Enter your instructions"/><br/>

					<input className="button-primary" type="submit" value="submit"/><br/>

				</form>

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

	// 	_handleLogOut: function(){
	// 	fbRef.unauth();
	// 	// MyAppRtr.navigate('login', {trigger: true})
	// 	window.location.hash = 'login'
	// },

	render: function(){
		return(
			<div className="headerContainer">
				<h1 className="title">Feed Generations</h1>
		 		{/*<button onClick={this._handleLogOut}>Log Out</button>*/}
			</div>
		)
	}

})

var NavBar = React.createClass({

	_handleLibrary: function(){
		window.location.hash = 'library'
	},

	_handleLogOut: function(){
	fbRef.unauth();
	// MyAppRtr.navigate('login', {trigger: true})
	window.location.hash = 'login'
	},

	_handleHome: function(){
		window.location.hash = 'home'
	},
	

	render: function(){
		return(
			<div className="navContainer">
				<button className="home" onClick={this._handleHome}>Home</button>
				<button className="library" onClick={this._handleLibrary}>Library</button>
				<button className="family" >Family</button>
				<button className="logOut" onClick={this._handleLogOut}>Log Out</button>
			</div>
		)
	}
})

var SearchLibary = React.createClass({

	// _handleSearchSubmit: function(keyEvent){
	// 	if(keyEvent.keyCode === 13){
	// 		var searchedRecipe = keyEvent.target.value
	// 		keyEvent.target.value = ''	
	// 	},

	// 	recipeSearch = new UserRecipeCollection(searchedRecipe)
	// 	recipeSearch.on('sync'. function(){
	// 		console.log('recipeSearch', recipeSearch)
	// 	})
	// },

	_handleSearchSubmit: function(keyEvent){
		if(keyEvent.which === 13){
			console.log(keyEvent.target.value)
			location.hash = 'search/'+keyEvent.target.value
		}
	},

	render: function(){
		return(
			<div className="searchContainer">
				<form>
					<input onKeyPress={this._handleSearchSubmit} type='text' id="searchlibrary" placeholder='search library' />
				</form>
			</div>
		)
	}

})


// var Pictures = React.createClass({

// 	imageFile:null

// 	_handleUpload: function(e){
// 		var inputEl = e.target 
// 		this.imageFile = inputEl.files[0]
// 	}, 

// 	_submitFile: function(){

// 	}

// })

var AppRouter = BackboneFire.Router.extend({
	routes: {
		"signup"	         : "showSignUpView",
		"login"		         : "showLoginView",
		"library/:recipeId": "showSingleRecipe",
		"library"          : "showRecipeLibrary",
		"search/:query"    : "showRecipeLibrary",
		"home"             : "showHome",
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
	
	showRecipeLibrary: function(query){

		console.log("from RecipeLibraryView")

		var userRecipeCollection
		if(query){
			userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid , query )
			// userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid)
		}
		else{
			userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid)
		}

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

