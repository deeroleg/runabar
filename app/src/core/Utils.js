export function initClickHandlers() {
    ['mousedown', 'touchstart'].forEach(function (el) {
      document.addEventListener(el, onObjClick);
    });
}

export function interaction(el, handler) {
    document.querySelectorAll('.obj').forEach(function (el) {
		el.style.zIndex = 0;
		el.classList.remove('is-active');
    });
    el.style.zIndex = 100;
    el.classList.add('is-active');
    
    let displayCenter = document.getElementById('desktop').offsetWidth / 2;
    let elWidth = el.offsetWidth/2;
    
    el.style.left = (displayCenter - elWidth) + 'px';
    el.style.top = '50px';

	var objType = el.classList.contains('wnd') ? 'isWindow' : '';
	
	switch (objType) {
		case 'isWindow':
			interact(el).draggable({
				allowFrom: ':not(.ent--static) > .obj-header',
				ignoreFrom: '.obj-control',
				onmove: onDragMove
			}).resizable({
				edges: {
					left: true,
					right: true,
					bottom: true,
					top: true
				},
				restrictEdges: {
					outer: 'parent',
					endOnly: true
				},
				// restrictSize: {
				//   min: { width: 480, height: 320 }
				// },
				margin: 12
			}).on('resizemove', function (event) {
				var target = event.target;
				var x = parseFloat(target.getAttribute('data-x')) || 0;
				var y = parseFloat(target.getAttribute('data-y')) || 0; // update the element's style

				target.style.width = event.rect.width + 'px';
				target.style.height = event.rect.height + 'px'; // translate when resizing from top or left edges

				x += event.deltaRect.left;
				y += event.deltaRect.top;
				target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
				target.setAttribute('data-x', x);
				target.setAttribute('data-y', y); // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
			});
			break;

		default:
			interact(el).draggable({
				allowFrom: '.obj-header',
				ignoreFrom: '.obj-control',
				onmove: onDragMove
		});
	}

	var objClose = el.querySelector('.btn-close');

	if (objClose) {
		objClose.addEventListener('click', function(e) { 
			onCloseButtonClick(e, handler);
		});
	}

	var objMin = el.querySelector('.btn-min');

	if (objMin) {
		objMin.addEventListener('click', onMinButtonClick);
	}

	var datemask = function datemask() {
		var selector = document.querySelectorAll('.date-input-mask');
		var im = new Inputmask({
			mask: '99/99/9999',
			placeholder: 'dd/mm/yyyy'
		});
		im.mask(selector);
	};
	datemask();

	var datetimemask = function datetimemask() {
		var selector = document.querySelectorAll('.datetime-input-mask');
		var im = new Inputmask({
			mask: '99/99/9999 99:99',
			placeholder: 'dd/mm/yyyy HH:MM'
		});
		im.mask(selector);
	};
	datetimemask();
	
//	fileUploadA11y(el);
}

export function fileUploadA11y(el) {
	var fakeButton = el.querySelectorAll('.addfile span[role="button"]');

	var onAction = function onAction(evt) {
		if (evt.which === 32 || evt.which === 13) {
			var input = evt.target.closest('.addfile').querySelector('.btn-addfile');
			evt.preventDefault();
			simulateClick(input);
		}
	};

	fakeButton.forEach(function (el) {
		el.removeEventListener('keypress', onAction);
		el.addEventListener('keypress', onAction);
		el.removeEventListener('keyup', onAction);
		el.addEventListener('keyup', onAction);
	});
};

function onDragMove(event) {
	var target = event.target; // keep the dragged position in the data-x/data-y attributes

	var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
	var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy; // translate the element

	target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'; // update the posiion attributes

	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);
}

function onObjClick(event) {
	var clickedEl = event.target;
	var objCurrent = clickedEl.closest('.obj');

	if (!clickedEl.closest('.obj') || clickedEl.closest('.obj.is-active')) {
		return;
	}

	document.querySelectorAll('.obj').forEach(function (el) {
		el.style.zIndex = 0;
		el.classList.remove('is-active');
	});
	objCurrent.style.zIndex = 100;
	objCurrent.classList.add('is-active');
}

function onCloseButtonClick(event, handler) {
	var objCurrent = event.target.closest('.obj');
	if ( typeof handler === 'function' ) {
		handler(objCurrent.getAttribute('data-key'))
	}
}

function onMinButtonClick(event) {
	var btn = event.target;
	var objCurrent = event.target.closest('.obj');
	var isMinimized = objCurrent.classList.contains('is-minimized');

	if (isMinimized) {
		objCurrent.classList.remove('is-minimized');
		btn.classList.remove('btn-min--show');
		btn.classList.add('btn-min--hide');
		btn.setAttribute('title', 'Minimize');
	} else {
		objCurrent.classList.add('is-minimized');
		btn.classList.remove('btn-min--hide');
		btn.classList.add('btn-min--show');
		btn.setAttribute('title', 'Expand');
	}
}

function _toConsumableArray(arr) {
	return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
	if (Array.isArray(arr)) {
		for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

		return arr2;
	}
}

function _iterableToArray(iter) {
	if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
	throw new TypeError("Invalid attempt to spread non-iterable instance");
}

export function categoriesDropdown(obj) {
	var menuItems = obj.querySelectorAll('.side-menu__item.dropright');
	var subLinks = obj.querySelectorAll('.side-submenu__link');
	var isOpen = false;

	var dropdownShow = function dropdownShow(container, submenu) {
		isOpen = true;
		container.classList.add('show');
		if ( submenu ) {
			submenu.classList.add('show');
		}
	};

	var dropdownHide = function dropdownHide(container, submenu) {
		isOpen = false;
		container.classList.remove('show');
		if ( submenu ) {
			submenu.classList.remove('show');
		}
		container.querySelectorAll('button').forEach(function (el) {
			el.blur();
		});
	};

	var onMouseOver = function onMouseOver(evt) {
		var container = evt.target.closest('.side-menu__item');
		var dropdown = container.querySelector('.side-submenu');
		!isOpen && dropdownShow(container, dropdown);
	};

	var onMouseLeave = function onMouseLeave(evt) {
		var container = evt.target.closest('.side-menu__item');
		var dropdown = container.querySelector('.side-submenu');
		isOpen && dropdownHide(container, dropdown);
	};

	var onBlur = function onBlur(evt) {
		var container = evt.target.closest('.side-menu__item');
		var dropdown = container.querySelector('.side-submenu');

		if (evt.relatedTarget && !evt.relatedTarget.closest('.side-submenu')) {
			isOpen && dropdownHide(container, dropdown);
		}
	};

	var onEscapePress = function onEscapePress(evt) {
		var isEscape = false;
		evt = evt || window.event;

		if ('key' in evt) {
			isEscape = evt.key === 'Escape' || evt.key === 'Esc';
		} else {
			isEscape = evt.keyCode === 27;
		}

		if (isOpen) {
			var container = _toConsumableArray(menuItems).filter(function (el) {
				return el.classList.contains('show');
			})[0];

			var dropdown = container.querySelector('.side-submenu');
			isEscape && dropdownHide(container, dropdown);
		}
	};

	menuItems.forEach(function (el) {
		el.addEventListener('mouseover', onMouseOver);
		el.addEventListener('mouseleave', onMouseLeave);
		el.addEventListener('click', onMouseLeave);
		el.querySelector('.side-menu__link').addEventListener('focus', onMouseOver);
		el.querySelector('.side-menu__link').addEventListener('blur', onBlur);
	});
	subLinks.forEach(function (el) {
		el.addEventListener('click', onMouseLeave);
		el.addEventListener('blur', onBlur);
	});
    document.addEventListener('keydown', onEscapePress);
};


export function datetime(date) {
	let result = '';
	const match = /^\d{2}(\d{2})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(date)
	if ( match ) {
		result = sprintf('%02d\\%02d\\%02d %02d:%02d', match[3], match[2], match[1], match[4], match[5]);
	}
	
	return result;
}

function simulateClick(elem) {
	// Create our event (with options)
	var evt = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		view: window
	}); // If cancelled, don't dispatch our event

	var canceled = !elem.dispatchEvent(evt);
};
