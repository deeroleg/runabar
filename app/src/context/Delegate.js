import React from 'react'

import { DelegationTypeAll, DelegationTypeCategories } from '../core/Const'

export const DelegateContext = React.createContext({
	form: {
		categories: [],
		type: DelegationTypeAll
	},
	updateType: (type) => {},
	updateCategoriesList: (list) => {}
});
