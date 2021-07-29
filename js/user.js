'use strict';

// global to hold the User instance of the currently-logged-in user
let currentUser;
let page = 'home';
/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
	console.debug('login', evt);
	evt.preventDefault();

	// grab the username and password
	const username = $('#login-username').val();
	const password = $('#login-password').val();

	// User.login retrieves user info from API and returns User instance
	// which we'll make the globally-available, logged-in user.
	currentUser = await User.login(username, password);

	$loginForm.trigger('reset');

	saveUserCredentialsInLocalStorage();
	updateUIOnUserLogin();
	displayButtons();
}

$loginForm.on('submit', login);

/** Handle signup form submission. */

async function signup(evt) {
	console.debug('signup', evt);
	evt.preventDefault();

	const name = $('#signup-name').val();
	const username = $('#signup-username').val();
	const password = $('#signup-password').val();

	// User.signup retrieves user info from API and returns User instance
	// which we'll make the globally-available, logged-in user.
	currentUser = await User.signup(username, password, name);

	saveUserCredentialsInLocalStorage();
	updateUIOnUserLogin();

	$signupForm.trigger('reset');
}

$signupForm.on('submit', signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
	console.debug('logout', evt);
	localStorage.clear();
	location.reload();
}

$navLogOut.on('click', logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
	console.debug('checkForRememberedUser');
	const token = localStorage.getItem('token');
	const username = localStorage.getItem('username');
	if (!token || !username) return false;

	// try to log in with these credentials (will be null if login failed)
	currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
	console.debug('saveUserCredentialsInLocalStorage');
	if (currentUser) {
		localStorage.setItem('token', currentUser.loginToken);
		localStorage.setItem('username', currentUser.username);
	}
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
	console.debug('updateUIOnUserLogin');
	hidePageComponents();
	$allStoriesList.show();
	updateNavOnLogin();
	displayButtons();
}

// display all buttons and saved settings (from localStorage)

function displayButtons() {
	if (!currentUser) return;

	displayIcon();
	if (currentUser.favorites.length) {
		localStorage.setItem('favoritesList', JSON.stringify(currentUser.favorites));
		displayFavorites();
	}
	if (currentUser.ownStories.length) {
		localStorage.setItem('ownStories', JSON.stringify(currentUser.ownStories));
		displayDeleteBtn();
	}
}

// display favorite icon only when the user is logged in

function displayIcon() {
	$('li button.icon').show();
}

// check localStorage for saved favoritesList and updates button

function displayFavorites() {
	if (localStorage.getItem('favoritesList')) {
		let parseList = JSON.parse(localStorage.getItem('favoritesList'));
		for (let { storyId } of parseList) {
			$(`#${storyId} button.icon`).addClass('favorite');
			$(`#${storyId} button.icon`).data('favorite', true);
		}
	}
}

// display delete button

function displayDeleteBtn() {
	if (localStorage.getItem('ownStories')) {
		let parseList = JSON.parse(localStorage.getItem('ownStories'));
		for (let { storyId } of parseList) {
			$(`#${storyId} button.trash`).show();
		}
	}
}

// handles adding/removing a story from the favorites list

async function handleFavorites(evt) {
	try {
		if (evt.target.className.includes('icon')) {
			const $btn = $(evt.target).closest('button');
			const $storyId = $btn.parent().attr('id');
			const $favorite = $btn.data('favorite');

			if ($favorite === false) {
				$btn.addClass('favorite');
				$btn.data('favorite', true);

				let newFavorite = await currentUser.addFavorite(currentUser, $storyId);
				currentUser.favorites = [ ...newFavorite ];
			} else {
				$btn.removeClass('favorite');
				$btn.data('favorite', false);

				if (page === 'favorites') $btn.closest('li').remove();

				let removedFavorite = await currentUser.removeFavorite(currentUser, $storyId);
				currentUser.favorites = [ ...removedFavorite ];
			}
		}
	} catch (e) {
		console.log(e);
	}
}

$('ol').on('click', handleFavorites);

// delete a story

async function handleDelete(evt) {
	try {
		if (evt.target.className.includes('trash')) {
			const $btn = $(evt.target).closest('button');
			const $storyId = $btn.closest('li').attr('id');

			const idx = currentUser.ownStories.findIndex(({ storyId }) => storyId === $storyId);
			currentUser.ownStories.splice(idx, 1);

			const idx2 = currentUser.favorites.findIndex(({ storyId }) => storyId === $storyId);
			currentUser.favorites.splice(idx2, 1);

			$btn.closest('li').remove();
			await storyList.deleteStory(currentUser, $storyId);
		}
	} catch (e) {
		console.log(e);
	}
}

$('ol').on('click', handleDelete);
