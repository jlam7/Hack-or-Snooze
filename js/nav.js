'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
	console.debug('navAllStories', evt);
	hidePageComponents();

	storyList = await StoryList.getStories();
	putStoriesOnPage(storyList);
	displayButtons();
	page = 'home';
}

$body.on('click', '#nav-all', navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
	console.debug('navLoginClick', evt);
	hidePageComponents();

	$loginForm.show();
	$signupForm.show();
}

$navLogin.on('click', navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
	console.debug('updateNavOnLogin');

	$('.main-nav-links').show();
	$navLogin.hide();
	$navLogOut.show();
	$navFavorites.show();
	$navAddStory.show();
	$navUserProfile.text(`${currentUser.username}`).show();
}

// Show addStory-form when click on "submit"

function navAddStory() {
	console.debug('navAddStory');
	hidePageComponents();

	$addStoryForm.show();
	page = 'add-story';
}

$navAddStory.on('click', navAddStory);

// Show a list of the logged-in user's favorite stories
function navFavorites() {
	console.debug('navFavorites');
	hidePageComponents();

	let stories = currentUser.favorites.map((story) => new Story(story));
	let favoriteList = { stories };

	putStoriesOnPage(favoriteList);
	displayButtons();
	page = 'favorites';
}

$navFavorites.on('click', navFavorites);
