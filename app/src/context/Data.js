import React from 'react'

export const DataContext = React.createContext({
	likes: {},
	votes: {},
	updateLikes: (type, document) => {},
	updateVotes: (document) => {},
	updateOfferData: (document) => {},
});
