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

var FamiliesCollection = BackboneFire.Firebase.Collection.extend({
	url: '', 
	initialize: function(){
		this.url = fbRef.child('families')
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

	_goToRecipeView: function(id){
		window.location.hash = "library/" + id 

	},

	_showRecipesJSX: function(mdl){
		if (!mdl.id) return ''

		return(
			
				<div className="libraryImgContainer">
					<img className="libraryViewPicture" src={mdl.get("picture")} onClick= {this._goToRecipeView.bind(this, mdl.id)} /> 
					<p onClick= {this._goToRecipeView.bind(this, mdl.id)} > {mdl.get("displayTitle")} </p>
				</div>
		
		)
	},

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
					{mdl.get("picture","displayTitle","ingredients","instructions","equipment")}
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

				<p>{this.state.userRecipes.displayTitle}</p>
				<p>Ingredients</p>
				{this.state.userRecipes.ingredients}
				<p>Equipment</p>
				{this.state.userRecipes.equipment}
				<p>Instructions</p>
				{this.state.userRecipes.instructions}
				<p>Summitted by: {this.state.userRecipes.submittedByInput} </p>


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
			summittedby: evt.target.submittedByInput.value

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
				<p>Welcome Home! </p>
				{/*{fbRef.getAuth().uid}*/}


				<form onSubmit={this._handleFormSubmit}>

					<input type="file" id="imageInput" onChange={this._handlePicture}/><br/>


				<div className="previewImgContainer">
					<img src={this.state.imageFileData}/> {/*--this.state.imageFileData is the selected image file from _handlePicture*/}	
				</div>

					<input type="text" id="displayTitle" placeholder="Enter recipe title"/><br/>
					<textarea type="text" id="ingredientsText" placeholder="Enter your ingredients"/><br/>
					<textarea type="text" id="equipmentText" placeholder="Enter your equipments"/><br/>
					<textarea type="text" id="instructionText" placeholder="Enter your instructions"/><br/>
					<input type="text" id="submittedByInput" placeholder="Enter your name"/><br/>

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
				id: authData.uid  //
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

					//location.hash = '' 
					location.hash = 'setfamily'		//<<<<<------------------routing to setfamily after user acct created!!!! 
					//after user has create a account, they need to be routed to the create family page 
				}
			})
		})
	},

	render: function(){
		return (
			<div>
				<form onSubmit={this._signUp}>
					<h1 className="signUp">Sign Up and Cook with your History</h1>

					<input type="text" id="name" placeholder="Name" /><br/>
					<input type="text" id="email" placeholder="Email" /><br/>
					<input type="text" id="password" placeholder="Password" /><br/>
					<input className="button-primary" type="submit" defaultValue="Sign Up" /><br/> 

				</form>	
			</div>
		)
	}

})

var SetFamilyView = React.createClass({

	_handleSetFamily: function(evt){
		evt.preventDefault()
		
		console.log(evt.currentTarget.familyNameInput.value), 
		console.log(evt.currentTarget.familyDescriptionInput.value), 
		console.log(evt.currentTarget.familyCreatorNameInput.value)

		var familyNameInput = evt.currentTarget.familyNameInput.value
		var familyDescriptionInput = evt.currentTarget.familyDescriptionInput.value
		var familyCreatorNameInput = evt.currentTarget.familyCreatorNameInput.value

		var newFamilyData = {
			familyName: familyNameInput, 
			familyDescription: familyDescriptionInput, 
			familyCreatorName: familyCreatorNameInput
		}

		console.log("----newFamilyData--------", newFamilyData)

		var familiesColl = new FamiliesCollection(fbRef.getAuth().uid)
			familiesColl.create({
				familyName: familyNameInput,
				familyDescription: familyDescriptionInput, 
				familyCreatorName: familyCreatorNameInput

			
			})
	},

	render: function(){
		return(
			<div className="setFamilyContainer">
				<form onSubmit={this._handleSetFamily} >
					<p>Create a Familly</p>
					<input type="text" id="familyNameInput" placeholder="Enter Family Name" />
					<input type="text" id="familyDescriptionInput" placeholder="Enter Family Description" />
					<input type="text" id="familyCreatorNameInput" placeholder="Enter Creator's Name" />
					<input type="submit" id="familySummitButton" defaultValue="submit" />
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
			<div className="LogInContainer">
				<form onSubmit={this._handleLogin}>
					<h1 className="logIn">Log In</h1>

					<input type="text" id="email" placeholder="email"/><br/>
					<input type="text" id="password" placeholder="password"/><br/>
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

				<div>
					<p>Join the Family!</p>
					<button onClick={this._goToSignUp} className="signUpButton">Sign Up</button>
				</div><br/>

				<div>
					<p>Already a Member?</p>
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
	window.location.hash = 'welcome'
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
		var typed = function(){
			keyEvent.target.value.toLowerCase()
		}

		if (typed.length > 0) {
			console.log(typed)
			console.log(`${typed}\uf8ff`)
			ref.orderByChild('searchTitle').startAt(typed).endAt(`${typed}\uf8ff`).on("value",	
			//^^^^^^^looking at the recipes title that startAt and endAt (with what is typed) - "uf8ff" is end character/apple logo ^^^^^^^^
				function(snapshot) {
					console.log('got snapshot')
					//snapshot is data that return from the query | below - the forEach is looking over the data for the title that was typed
					snapshot.forEach(function(obj) {
						var recipeTitle = obj.val().searchTitle //the result of what is type in the query
						console.log('data item>>>',recipeTitle)
						
						component.setState({
							currentSearchVal: recipeTitle
						})

					})
			})
		}

		if(keyEvent.which === 13){
			keyEvent.preventDefault()

			console.log(keyEvent.target.value)
			if(typed.length > 0 ) {
				window.location.hash = 'library/' + 'search/' + typed
			}	
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
		"setfamily"						: "showSetFamily",
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

	showSetFamily: function(){

		console.log("from SetFamily")
		// new usermodel --> props --> save fam id to user modl in submit in evt handle 
		DOM.render( <SetFamilyView />, document.querySelector('.container') )

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
			// userRecipeCollection = new UserRecipeCollection(fbRef.getAuth().uid)
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

