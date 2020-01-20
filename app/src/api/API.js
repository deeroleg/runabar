import { sprintf } from 'sprintf-js'
import cookie from 'react-cookies'

import Authorization from '../components/modals/Authorization'
import NewCategory from '../components/modals/NewCategory'
import NewOffer from '../components/modals/NewOffer'
import NewTopic from '../components/modals/NewTopic'
import NewQuestion from '../components/modals/NewQuestion'
import Comments from '../components/modals/Comments'
import Settings from '../components/modals/Settings'
import Intro from '../components/modals/Intro'
import Profile from '../components/modals/Profile'
import Password from '../components/modals/Password'
import VideoForm from '../components/modals/video/Form'
import VideoView from '../components/modals/video/View'
import Project from '../components/documents/Project'
import Offer from '../components/documents/Offer'
import Topic from '../components/documents/Topic'
import PasswordReset from '../components/modals/password/reset/Form'
import PasswordResetFinish from '../components/modals/password/reset/Finish'
import DelegationForm from '../components/modals/delegations/Form'
import SingleDelegationForm from '../components/modals/delegations/SingleForm'

const ROUTES = {
	'faq': {
		url: 'pages/faq/',
		method: 'GET',
		list: true,
		single: false
	},
	'page': {
		url: 'pages/text/?type=%s',
		method: 'GET',
		list: false,
		single: true
	},
	'authorization': {
		compName : Authorization,
		url: '',
		method: 'POST'
	},
	'me': {
		url: 'users/me/',
		method: 'GET',
		restricted: true
	},
	'nullify': {
		url: 'users/me/nullify/',
		method: 'POST',
		restricted: true
	},
	'logout': {
		url: 'logout/',
		method: 'POST',
		restricted: true
	},
	'settings': {
		compName : Settings,
		url: '',
		method: 'POST',
		restricted: true
	},
	'geo': {
		url: 'geo/search/?query=%s',
		method: 'GET'
	},
	'projects': {
		url: 'projects/',
		method: 'GET',
		restricted: true
	},
	'project': {
		compName : Project,
		url: 'projects/%s/',
		method: 'GET',
		restricted: true
	},
	'categories_tree': {
		url: 'projects/%s/categories/tree/',
		method: 'GET',
		restricted: true
	},
	'new-category': {
		compName : NewCategory,
		url: '',
		method: 'POST',
		restricted: true
	},
	'offers': {
		url: 'projects/%s/offers/',
		method: 'GET',
		restricted: true
	},
	'votings': {
		url: 'projects/%s/votings/',
		method: 'GET',
		restricted: true
	},
	'topics': {
		url: 'projects/%s/topics/',
		method: 'GET',
		restricted: true
	},
	'new-offer': {
		compName : NewOffer,
		url: 'projects/%s/offers/create/',
		method: 'POST',
		restricted: true
	},
	'new-topic': {
		compName : NewTopic,
		url: 'projects/%s/topics/create/',
		method: 'POST',
		restricted: true
	},
	'categories': {
		url: 'projects/%s/categories/',
		method: 'GET',
		restricted: true
	},
	'subcategories': {
		url: 'categories/%s/subcategories/',
		method: 'GET',
		restricted: true
	},
	'offer': {
		compName : Offer,
		url: 'offers/%s/',
		method: 'GET',
		restricted: true
	},
	'topic': {
		compName : Topic,
		url: 'topics/%s/',
		method: 'GET',
		restricted: true
	},
	'offer_like': {
		url: 'offers/%s/like/',
		method: 'POST',
		restricted: true
	},
	'topic_like': {
		url: 'topics/%s/like/',
		method: 'POST',
		restricted: true
	},
	'intro': {
		compName : Intro,
	},
	'voting_vote': {
		url: 'votings/%s/vote/',
		method: 'POST',
		restricted: true
	},
	'offer_comments': {
		compName : Comments,
		url: 'offers/%s/comments/',
		method: 'GET',
		restricted: true
	},
	'topic_comments': {
		url: 'topics/%s/comments/',
		method: 'GET',
		restricted: true
	},
	'offer_comments_create': {
		url: 'offers/%s/comments/create/',
		method: 'POST',
		restricted: true
	},
	'topic_comments_create': {
		url: 'topics/%s/comments/create/',
		method: 'POST',
		restricted: true
	},
	'profile': {
		compName : Profile,
		url: 'users/%s/',
		method: 'GET',
		restricted: true
	},
	'user_activity': {
		url: 'users/%s/activity',
		method: 'GET',
		restricted: true
	},
	'video_create': {
		compName : VideoForm,
		url: 'users/me/video/create/',
		method: 'POST',
		restricted: true
	},
	'user_video': {
		compName : VideoView,
		url: 'users/%s/video/',
		method: 'GET',
		restricted: true
	},
	'user_video_complain': {
		url: 'users/%s/video/complain/',
		method: 'POST',
		restricted: true
	},
	'password_reset': {
		compName : PasswordReset,
		url: 'password_reset/',
		method: 'POST',
	},
	'password_reset_finish': {
		compName : PasswordResetFinish,
		url: 'password_reset/finish/',
		method: 'POST',
	},
	'new-question': {
		compName : NewQuestion,
		url: 'questions/create/',
		method: 'POST',
		restricted: true
	},
	'password': {
		compName : Password,
		url: 'users/me/edit/password/',
		method: 'POST',
		restricted: true
	},
	'delegation_form': {
		compName : DelegationForm,
		url: 'users/me/delegate',
		method: 'POST',
		restricted: true
	},
	'single_delegation_form': {
		compName : SingleDelegationForm,
		url: 'users/me/delegate',
		method: 'POST',
		restricted: true
	},
	'user_delegations_tree': {
		url: 'users/me/delegations',
		method: 'POST',
		restricted: true
	},
	'user_delegated_tree': {
		url: 'users/me/delegated',
		method: 'POST',
		restricted: true
	},
	'remove_delegation': {
		url: 'users/me/delegations/delete',
		method: 'POST',
		restricted: true
	},
	'delegations_categories': {
		url: 'users/me/delegations/categories',
		method: 'POST',
		restricted: true
	},
	'users_search': {
		url: 'users/search/?query=%s',
		method: 'GET',
		restricted: true
	},
};

const Config = require('Config');

export const getRequest = (action, ...data) => {
	const cfg = getModalConfig(action);
	let url = sprintf(cfg['url'], data);

	if ( cfg ) {
		let headers = {};

		if ( cfg['restricted'] ) {
			headers['X-Runabar-Auth-Token'] = cookie.load(Config.authCookieName);
		}

		let res = {
			link: Config.serverUrl + url,
			obj: {
				method: cfg['method'], 
				headers: headers
			}
		}

		return res;
	}
	
	return undefined;
}

export const getModalConfig = (action) => ROUTES[action]

export function authenticate(handleUpdateUser) {
	if ( cookie.load(Config.authCookieName) ) {
		const { link, obj } = getRequest('me');
		
		fetch(link, obj)
			.then((res) => {
				if ( res.status == 401 ) {
					cookie.remove(Config.authCookieName, { path: '/' });
					handleUpdateUser({});
				}
				return res.json();
			})
			.then(
				(result) => {
					handleUpdateUser(result);
				}
			);
	}
}

export function logout() {
	const { link, obj } = getRequest('logout');
	
	fetch(link, obj)
		.then((res) => {
			return res.json();
		})
		.then(
			(result) => {
				cookie.remove(Config.authCookieName, { path: '/' });
				window.location.reload();
			}
		);
}
