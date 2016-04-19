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

import JSPDF from 'jspdf'

console.log('===========jspdf==========')
console.log(JSPDF)

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
			this.url = fbRef.child('users').child(uid).child('recipes').orderByChild('searchTitle').equalTo(query)
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


	_handleRemoveRecipe: function(mdl, evt){
		console.log("model id ", mdl)
		this.props.recipeColl.remove(mdl)

	},

	_goToRecipeView: function(id){
		window.location.hash = "library/" + id 
	},

	_showRecipesJSX: function(mdl){
		if (!mdl.id) return ''

		return(
				<div className="libraryContainer">
					<p onClick= {this._goToRecipeView.bind(this, mdl.id)} > {mdl.get("displayTitle")} </p>
					<div className="recipelibraryPictureContainer">
					<button onClick={this._handleRemoveRecipe.bind(this, mdl.id)} >X</button>
						<img className="libraryViewPicture" src={mdl.get("picture")} onClick= {this._goToRecipeView.bind(this, mdl.id)} /> 
					</div>
				</div>
		)
	},

	componentDidMount: function(){
		var component = this 
		console.log(this.props.recipeColl)
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
				<p>Recipe Library</p>

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
					displayTitle: "", 
					ingredients: "", 
					instructions: "", 
					equipment: ""}
		}
	},

	_showRecipesJSX: function(mdl){
		if(!mdl.id) return 'no id found'

			return(
				
				<p>
					{mdl.get("picture","displayTitle","ingredients","instructions","equipment") }
				</p>
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
					displayTitle: component.props.recipeMdl.get("displayTitle"), 
					ingredients: component.props.recipeMdl.get("ingredients"), 
					instructions: component.props.recipeMdl.get("instructions"), 
					equipment: component.props.recipeMdl.get("equipment")

				}
			})
	},

	_handleEquipment: function(){
		if ( <h6>Equipment</h6> && this.state.userRecipes.equipment !== '' ){
			return this.state.userRecipes.equipment
		}
		else{
			return ''
		}
	},

	render: function(){

		var component = this 

		// debugger;

		return(
			<div>
				<Header />
				<NavBar />

				<div className="singleImgContainer">
					<img className="SingleViewPicture" src={this.state.userRecipes.picture} />
				</div>

				<h4>{this.state.userRecipes.displayTitle}</h4>
				<h6>Ingredients</h6>
				{this.state.userRecipes.ingredients}
				{/*<h6>Equipment</h6>/*}
				{/*{this.state.userRecipes.equipment}*/}
				{this._handleEquipment}
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
		console.log(evt.target.displayTitle.value)
		//console.log(evt.target.searchTitle.value.toLowerCase())
		console.log(evt.target.ingredientsText.value)
		console.log(evt.target.instructionText.value)
		console.log(evt.target.equipmentText.value)
		console.log(evt.target.submittedByInput.value)


		var userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid)

		userRecipeCollection.create({

			// picture: evt.target.imageInput.imageFileData,
			picture: this.state.imageFileData,

			displayTitle: evt.target.displayTitle.value, 
			searchTitle: evt.target.displayTitle.value.toLowerCase(),	
			//title: evt.target.title.value,
			// display_title:
			// search_title: .toLowerCase()
			ingredients: evt.target.ingredientsText.value,
			equipment: evt.target.equipmentText.value,
			instructions: evt.target.instructionText.value,
			summittedBy: evt.target.submittedByInput.value


		})

		console.log(userRecipeCollection)

		
		evt.target.displayTitle.value = ''
		evt.target.ingredientsText.value = ''
		evt.target.equipmentText.value = ''
		evt.target.instructionText.value = ''
		evt.target.submittedByInput.value = ''
		//^^^^^^clear the input box after submission^^^^^^//

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
				<p>Welcome Home!  </p>
				{/*{fbRef.getAuth().uid}*/}


				<form onSubmit={this._handleFormSubmit}>

					<input type="file" id="imageInput" onChange={this._handlePicture}/><br/>


				<div className="previewImgContainer">
					<img src={this.state.imageFileData}/> {/*--this.state.imageFileData is the selected image file from _handlePicture*/}	
				</div>

					<input type="text" id="displayTitle" placeholder="recipe title"/><br/>
					<textarea type="text" id="ingredientsText" placeholder="Enter your ingredients"/><br/>
					<textarea type="text" id="equipmentText" placeholder="Enter your equipments"/><br/>
					<textarea type="text" id="instructionText" placeholder="Enter your instructions"/><br/>
					<input type="text" id="submittedByInput" placeholder="Enter your name" /><br/>
					<input className="button-primary" type="submit" value="submit"/><br/>


				</form> 

			</div>	
			
		)
	},

})


var SignUpView = React.createClass({

	_signUp: function(evt){ 	//pasing the evt(clicking of the button)

		evt.preventDefault()	//????
		evt.target.value = ""

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

			// authenticate the user  (hint: look at _handleLogin in SignUpView) 
			fbRef.authWithPassword(authDataObj, function(err, authData){
				if(err){
					alert("Error in Creating Account. Try Again.")
				}
				else{
					console.log("---signup user authenticated-------------")
					console.log(authData)

					location.hash = '' 
				}
			})
		})
	},

	render: function(){
		return (
			<div>
				<form onSubmit={this._signUp}>
					<p className="signUp">Sign Up and Cook with your History</p>

					<input type="text" id="name" placeholder="Name" /><br/>
					<input type="text" id="email" placeholder="Email" /><br/>
					<input type="password" id="password" placeholder="Password" /><br/>
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
				console.log("---data from log in-------", authData)

				window.location.hash = ''
			}
		})
	}, 

	render: function(){
		return(
			<div>
				<form onSubmit={this._handleLogin}>
					<p className="loginIn">Log In</p>

					<input type="text" id="email" placeholder="email"/><br/>
					<input type="password" id="password" placeholder="password"/><br/>
					<input className="button-primary" type="submit" defaultValue="Log In"/><br/>

				</form>
			</div>
		)
	}

})

var WelcomeView = React.createClass({


	_goToSignUp: function(){
		location.hash = 'signup'
	},

	_goToLogin: function(){
		location.hash = 'login'
	},

	render: function(){

		return(
			<div>
				<Header/>

				<div className="welcomeSignUpContainer">
					<p className="welcome_SignUpTitle">Join the Family!</p>
					<button onClick={this._goToSignUp} className="signUpButton">Sign Up</button>
				</div><br/>

				<div className="welcomeLogInContainer">
					<p className="welcome_LogIn">Already a Member?</p>
					<button onClick={this._goToLogin} className="logInButton">Log In</button>
				</div>
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
				<h1 className="headerTitle">Feed Generations</h1>
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
	getInitialState: function(){
		return{
			currentSearchVal: ""

		}
	},

	_handleSearchSubmit: function(keyEvent){

		var component = this 

		var ref = new Firebase(`https://feedgenerations.firebaseio.com/users/${fbRef.getAuth().uid}/recipes`);
		// var typed = function(){
		// 	keyEvent.target.value.toLowerCase()
		// }
		var typed = keyEvent.target.value.toLowerCase()


		// if (typed.length > 0) {
		// 	console.log(typed)
		// 	console.log(`${typed}\uf8ff`)
		// 	ref.orderByChild('searchTitle').startAt(typed).endAt(`${typed}\uf8ff`).on("value",	
		// 	//^^^^^^^looking at the recipes title that startAt and endAt (with what is typed) - "uf8ff" is end character/apple logo ^^^^^^^^	
		// 		function(snapshot) {
					
		// 			console.log('got snapshot')
		// 			//snapshot is data that return from the query | below - the forEach is looking over the data for the title that was typed
		// 			snapshot.forEach(function(obj) {
		// 				var recipeTitle = obj.val().searchTitle //the result of what is type in the query
		// 				console.log('data item>>>',recipeTitle)
						
		// 				component.setState({
		// 					currentSearchVal: recipeTitle
		// 				})

		// 			})
		// 	})
		// }

		if(keyEvent.keyCode === 13){
			keyEvent.preventDefault()

			console.log(keyEvent.target.value)
			ref.orderByChild('searchTitle').startAt(typed).endAt(`${typed}\uf8ff`).on("value",	
			//^^^^^^^looking at the recipes title that startAt and endAt (with what is typed) - "uf8ff" is end character/apple logo ^^^^^^^^	
				function(snapshot) {
					
					console.log('got snapshot')
					//snapshot is data that return from the query | below - the forEach is looking over the data for the title that was typed
					snapshot.forEach(function(obj) {
						console.log(obj.val().searchTitle)
						var recipeTitle = obj.val().searchTitle //the result of what is type in the query
						React.unmountComponentAtNode(document.querySelector('.container'))
						location.hash = "library/search/" + recipeTitle
					})
			})
		}
		
	},

	render: function(){
		return(
			<div className="searchContainer">
				<form>
					<input onKeyDown={this._handleSearchSubmit} type='text' id="searchlibrary" placeholder='search library' />
					<p>{this.state.currentSearchVal}</p>
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
		"signup"	         			: "showSignUpView",
		"login"		         			: "showLoginView",
		"welcome"						: "showWelcome",
		"library/search/:query"   		: "showRecipeLibrary",
		"library/:recipeId"				: "showSingleRecipe",
		"library"          				: "showRecipeLibrary",
		"home"             				: "showHome",
		"*def"             				: "showHome"	

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

	showWelcome: function(){

		console.log("from WelcomeVIew")

		DOM.render( <WelcomeView />, document.querySelector('.container') )

	},

	showHome: function(){

		console.log("from HomeView")

		DOM.render( <HomeView />, document.querySelector('.container') )

	},

	
	showRecipeLibrary: function(query){

		console.log("from RecipeLibraryView")

		var userRecipeCollection
		if(query){
			userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid , query )
			// userxRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid)
			console.log('queried recipes>>>>', userRecipeCollection)
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
		if( !fbRef.getAuth() && 
			window.location.hash!== '#signup' &&
			window.location.hash!== '#login'
		){	
			location.hash = "welcome"
		//^^^^^^^if user is not authorize or window.location.hash is not equal to signup hash than route user to welcome page 
		}

		this.on('route', function(){
			if(!fbRef.getAuth() && 
				window.location.hash!== "#signup" &&
				window.location.hash!== '#login'
			){
				location.hash = "welcome"
		//^^^^^^^if the user route is on an unauthorize hash or #signup than route user to welcome		
			}
		})

	console.log("----from initialize----------", window.location.hash)

	// if(!fbRef.getAuth() && window.location.hash!== '#signup'){
	// 	location.hash = "login"
	// }

	// this.on('route', function(){
	// 	if(fbRef.getAuth() && window.location.hash!== '#signup'){
	// 	ocation.hash = "login"
	// 	}
	// })


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

