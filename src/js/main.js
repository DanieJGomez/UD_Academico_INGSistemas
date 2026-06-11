document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Toggle Sidebar
    const toggleSidebar = () => {
        sidebarContainer.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        document.body.style.overflow = sidebarContainer.classList.contains('active') ? 'hidden' : '';
    };

    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // Modular Loading Function
    const loadSidebar = async () => {
        try {
            const sidebarContainer = document.getElementById('sidebar-container');
            if (!sidebarContainer) return;

            const sidebarPath = window.sidebarPath || 'src/html/sidebar.html';
            const response = await fetch(sidebarPath);
            if (!response.ok) throw new Error(`Failed to load ${sidebarPath}`);

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const sidebarContent = doc.querySelector('.sidebar-inner') || doc.body || doc.documentElement;
            sidebarContainer.innerHTML = sidebarContent.innerHTML;

            const currentUrl = new URL(window.location.href);
            const sidebarAbsoluteUrl = new URL(sidebarPath, currentUrl);
            const appRootUrl = new URL('../../', sidebarAbsoluteUrl);

            const calculateRelativePath = (fromUrl, toUrl) => {
                if (fromUrl.origin !== toUrl.origin) return toUrl.href;
                const fromSegments = fromUrl.pathname.split('/').filter(Boolean);
                const toSegments = toUrl.pathname.split('/').filter(Boolean);
                fromSegments.pop();

                let i = 0;
                while (i < fromSegments.length && i < toSegments.length && fromSegments[i] === toSegments[i]) {
                    i++;
                }

                const up = fromSegments.length - i;
                const relativeSegments = [...Array(up).fill('..'), ...toSegments.slice(i)];
                let relativePath = relativeSegments.join('/');
                if (toUrl.search) relativePath += toUrl.search;
                if (toUrl.hash) relativePath += toUrl.hash;
                return relativePath || '.';
            };

            const links = sidebarContainer.querySelectorAll('a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;

                const trimmedHref = href.trim();
                if (
                    trimmedHref.startsWith('http://') ||
                    trimmedHref.startsWith('https://') ||
                    trimmedHref.startsWith('mailto:') ||
                    trimmedHref.startsWith('tel:') ||
                    trimmedHref.startsWith('#')
                ) {
                    return;
                }

                try {
                    const targetUrl = new URL(trimmedHref, appRootUrl);
                    const relativeHref = calculateRelativePath(currentUrl, targetUrl);
                    link.setAttribute('href', relativeHref);
                } catch (linkError) {
                    console.warn('Could not normalize sidebar link:', href, linkError);
                }
            });

            initAccordion();

            const linksToClose = sidebarContainer.querySelectorAll('a');
            linksToClose.forEach(link => {
                link.addEventListener('click', () => {
                    if (sidebarContainer.classList.contains('active')) toggleSidebar();
                });
            });

        } catch (error) {
            console.error('Error loading sidebar:', error);
            const sidebarContainer = document.getElementById('sidebar-container');
            if (sidebarContainer) sidebarContainer.innerHTML = '<div style="padding:2rem;color:red;">Error: No se pudo cargar el menú lateral.</div>';
        }
    };

    const loadSemesters = async () => {
        const container = document.getElementById('semesters-container');
        if (!container) return;

        const semestersToLoad = 10;
        let allHtml = '';

        for (let i = 1; i <= semestersToLoad; i++) {
            try {
                const response = await fetch(`src/semestres/semestre${i}.html`);
                if (response.ok) {
                    const html = await response.text();
                    allHtml += html;
                }
            } catch (error) {
                console.warn(`Could not load semestre ${i}:`, error);
            }
        }
        container.innerHTML = allHtml;
    };

    const init = async () => {
        // Check if we are running on file:// protocol (CORS issue)
        if (window.location.protocol === 'file:') {
            console.warn('Fetch may fail on file:// protocol. Use a local server for modular features.');
        }

        await Promise.all([loadSidebar(), loadSemesters()]);
        initNavHighlight();
    };

    const initAccordion = () => {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                
                // Close others
                document.querySelectorAll('.accordion-item').forEach(otherItem => {
                    if (otherItem !== item) otherItem.classList.remove('active');
                });

                item.classList.toggle('active');
            });
        });
    };

    const initNavHighlight = () => {
        const sections = document.querySelectorAll('.section-header');
        const navLinks = document.querySelectorAll('.nav-links a');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 120) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current) && current !== '') {
                    link.classList.add('active');
                }
            });
        });
    };

    init();
});
