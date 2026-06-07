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
            // Check if we are running on file:// protocol (CORS issue)
            if (window.location.protocol === 'file:') {
                console.warn('Fetch may fail on file:// protocol. Use a local server for modular features.');
            }
            
            const response = await fetch('src/html/sidebar.html');
            if (!response.ok) throw new Error('Failed to load sidebar.html');
            
            const html = await response.text();
            sidebarContainer.innerHTML = html;
            
            // Initialize Sidebar Features after loading
            initAccordion();
            initNavHighlight();
            
            // Close sidebar when clicking links
            const links = sidebarContainer.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    if (sidebarContainer.classList.contains('active')) toggleSidebar();
                });
            });

        } catch (error) {
            console.error('Error loading sidebar:', error);
            // Fallback for file:// or other errors
            sidebarContainer.innerHTML = '<div style="padding:2rem;color:red;">Error: No se pudo cargar el menú lateral. Asegúrate de usar un servidor local (Live Server).</div>';
        }
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

    loadSidebar();
});
