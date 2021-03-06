'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage(storyList);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
	// console.debug("generateStoryMarkup", story);

	const hostName = story.getHostName();
	return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <button class='icon hidden' data-favorite=false><i class="far fa-star icon"></i></button>
        <button class='trash hidden'><i class="fas fa-trash"></i></button>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(list) {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of list.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

// use input values from the form to create newStory and update the DOM with a newStory

async function submitAddStoryForm(evt) {
	try {
		console.debug('submitAddStoryForm', evt);
		evt.preventDefault();

		const title = $('#title').val();
		const author = $('#author').val();
		const url = $('#URL').val();

		const storyObj = {
			title,
			author,
			url
		};

		$addStoryForm.trigger('reset');

		let newStory = await storyList.addStory(currentUser, storyObj);
		currentUser.ownStories.push(newStory);

		hidePageComponents();
		putStoriesOnPage(storyList);
		displayButtons();
	} catch (e) {
		console.log(e);
	}
}

$addStoryForm.on('submit', submitAddStoryForm);
