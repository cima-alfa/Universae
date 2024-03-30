{
	const primaryNavMenu = document.querySelector('.primary-nav--menu');

	primaryNavMenu.addEventListener('click', (event) => {
		if (!event.target.closest('[data-has-submenu] > .primary-nav--link')) {
			return;
		}

		const primaryLinkWithSubmenu = event.target.closest('[data-has-submenu]');

		document.querySelectorAll('[data-has-submenu="open"]').forEach((element) => {
			if (primaryLinkWithSubmenu !== element) {
				element.setAttribute('data-has-submenu', 'closed');
			}
		});

		if (primaryLinkWithSubmenu.dataset.hasSubmenu !== 'open') {
			primaryLinkWithSubmenu.setAttribute('data-has-submenu', 'open');
			
			primaryNavMenu.scrollTop = primaryLinkWithSubmenu.offsetTop - parseFloat(window.getComputedStyle(primaryNavMenu, null)?.paddingTop);
		} else {
			primaryLinkWithSubmenu.setAttribute('data-has-submenu', 'closed');
		}
	});

	const htmlRoot = document.querySelector('html');
	const primaryNav = document.querySelector('.primary-nav');
	const primaryNavMenuToggle = document.querySelector('.primary-nav-menu--toggle');
	const toggleMenuEvent = (event) => {
		event.stopImmediatePropagation();
		
		if (primaryNav.dataset.mobile === 'open' && !event.target.closest('.primary-nav--menu')) {
			primaryNav.setAttribute('data-mobile', 'closed');
			htmlRoot.dataset.overflow = 'enabled';
			htmlRoot.removeEventListener('click', toggleMenuEvent);
		}
	};

	primaryNavMenuToggle.addEventListener('click', (event) => {
		event.stopImmediatePropagation();

		if (primaryNav.dataset.mobile !== 'open') {
			primaryNav.setAttribute('data-mobile', 'open');
			htmlRoot.dataset.overflow = 'disabled';
			htmlRoot.addEventListener('click', toggleMenuEvent);
		} else {
			primaryNav.setAttribute('data-mobile', 'closed');
			htmlRoot.dataset.overflow = 'enabled';
			htmlRoot.removeEventListener('click', toggleMenuEvent);
		}
	});

	const searchBox = document.querySelector('.search-wrapper');
	const searchBoxToggle = document.querySelector('[data-nav-action="search"]');
	const toggleSearchBoxEvent = (event) => {console.log(searchBox.dataset.open);
		event.stopImmediatePropagation();
		
		if (searchBox.dataset.open !== undefined && !event.target.closest('.search')) {
			searchBox.toggleAttribute('data-open', false);
			htmlRoot.dataset.overflow = 'enabled';
			htmlRoot.removeEventListener('click', toggleSearchBoxEvent);
		}
	};

	searchBoxToggle.addEventListener('click', (event) => {
		event.stopImmediatePropagation();

		if (searchBox.dataset.open === undefined) {
			if (primaryNav.dataset.mobile === 'open') {
				primaryNavMenuToggle.click();
			}

			searchBox.toggleAttribute('data-open', true);
			htmlRoot.dataset.overflow = 'disabled';
			htmlRoot.addEventListener('click', toggleSearchBoxEvent);
		}
	});
}