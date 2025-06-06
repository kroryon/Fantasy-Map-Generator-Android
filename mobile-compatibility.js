/**
 * Mobile Compatibility Script for Fantasy Map Generator
 * Lightweight touch improvements and mobile fixes
 */

(function() {
    'use strict';    // Check if we're in a mobile environment or emulator
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isCapacitor = window.Capacitor !== undefined;
    const isAndroidWebView = /wv/.test(navigator.userAgent);
    const isBlueStacks = navigator.userAgent.includes('BlueStacks') || 
                        window.navigator.platform === 'Win32' && /Android/i.test(navigator.userAgent);
    const isEmulator = isBlueStacks || navigator.userAgent.includes('Emulator');

    console.log('Mobile Compatibility Script loaded', {
        isMobile,
        isCapacitor,
        isAndroidWebView,
        isBlueStacks,
        isEmulator,
        userAgent: navigator.userAgent,
        platform: navigator.platform
    });

    // Mobile-specific improvements (including emulators)
    if (isMobile || isCapacitor || isEmulator) {
        initMobileCompatibility();
    }function initMobileCompatibility() {
        // 1. Improve viewport
        improveViewport();
        
        // 2. Add mobile-specific CSS
        addMobileCSSFixes();
        
        // 3. Fix touch events (IMPORTANT: this was missing!)
        fixTouchEvents();
        
        // 4. Fix menu closing issues (lightweight)
        fixMenuClosing();
        
        // 5. Improve performance
        improvePerformance();
        
        console.log('Mobile compatibility enhancements applied');
    }    function fixTouchEvents() {
        // Enhanced touch support with BlueStacks compatibility
        console.log('Fixing touch events for mobile/emulator compatibility...');
        
        // Ensure click events work properly on touch devices and emulators
        const enableClickSupport = () => {
            // Add 'cursor: pointer' to clickable elements for better emulator compatibility
            const style = document.createElement('style');
            style.textContent = `
                button, .icon, [onclick], [role="button"], .clickable {
                    cursor: pointer !important;
                    -webkit-tap-highlight-color: rgba(0,0,0,0.1);
                    user-select: none;
                }
                
                button:hover, .icon:hover, [onclick]:hover, [role="button"]:hover {
                    opacity: 0.8;
                }
                
                .touch-active {
                    background-color: rgba(0,0,0,0.1) !important;
                    transform: scale(0.98);
                }
            `;
            document.head.appendChild(style);
        };
        
        // Add visual feedback for buttons without interfering with clicks
        const addTouchFeedback = (selector) => {
            setTimeout(() => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Only add visual feedback, don't interfere with events
                    element.addEventListener('touchstart', function() {
                        this.classList.add('touch-active');
                    }, { passive: true });
                    
                    element.addEventListener('touchend', function() {
                        setTimeout(() => this.classList.remove('touch-active'), 150);
                    }, { passive: true });
                    
                    element.addEventListener('touchcancel', function() {
                        this.classList.remove('touch-active');
                    }, { passive: true });
                });
            }, 1000); // Reduced wait time
        };

        // Apply styles immediately
        enableClickSupport();
        
        // Apply to common UI elements
        addTouchFeedback('button');
        addTouchFeedback('.icon');
        addTouchFeedback('[onclick]');
        addTouchFeedback('.menu-item');
        addTouchFeedback('.panel-button');
        
        // BlueStacks specific fix: ensure mouse events are properly handled
        if (navigator.userAgent.includes('BlueStacks') || window.navigator.platform === 'Win32') {
            console.log('Applying BlueStacks/Windows specific fixes...');
            
            // Ensure mouse events trigger properly
            document.addEventListener('mousedown', function(e) {
                if (e.target.matches('button, .icon, [onclick], [role="button"]')) {
                    e.target.classList.add('touch-active');
                }
            }, { passive: true });
            
            document.addEventListener('mouseup', function(e) {
                if (e.target.matches('button, .icon, [onclick], [role="button"]')) {
                    setTimeout(() => e.target.classList.remove('touch-active'), 150);
                }
            }, { passive: true });
        }
    }

    function improveViewport() {
        // Ensure proper viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // Optimize viewport for mobile
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
        
        // Prevent zoom on input focus (can be adjusted if needed)
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (viewport.content.includes('user-scalable=no')) {
                    viewport.content = viewport.content.replace('user-scalable=no', 'user-scalable=yes');
                }
            });
        });
    }

    function fixMenuClosing() {
        // Enhanced menu closing functionality
        let isMenuOpen = false;
        let currentOpenMenu = null;

        // Monitor for menu opens
        const observeMenus = () => {
            const menus = document.querySelectorAll('[id*="menu"], [class*="menu"], [id*="panel"], [class*="panel"], [id*="dialog"], [class*="dialog"]');
            
            menus.forEach(menu => {
                // Watch for visibility changes
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                            const isVisible = menu.style.display !== 'none' && 
                                            menu.style.visibility !== 'hidden' && 
                                            menu.offsetParent !== null;
                            
                            if (isVisible && !isMenuOpen) {
                                isMenuOpen = true;
                                currentOpenMenu = menu;
                                setupMenuClosing(menu);
                            } else if (!isVisible && isMenuOpen && currentOpenMenu === menu) {
                                isMenuOpen = false;
                                currentOpenMenu = null;
                            }
                        }
                    });
                });

                observer.observe(menu, {
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            });
        };

        // Setup menu closing for a specific menu
        const setupMenuClosing = (menu) => {
            // Close on outside click/touch
            const closeOnOutside = (e) => {
                if (!menu.contains(e.target) && menu.style.display !== 'none') {
                    // Find and trigger close button
                    const closeBtn = menu.querySelector('.close, .icon-times, [onclick*="close"], [onclick*="hide"]');
                    if (closeBtn) {
                        closeBtn.click();
                    } else {
                        // Force hide menu
                        menu.style.display = 'none';
                        menu.style.visibility = 'hidden';
                    }
                    isMenuOpen = false;
                    currentOpenMenu = null;
                }
            };

            // Add click and touch listeners
            setTimeout(() => {
                document.addEventListener('click', closeOnOutside, { passive: true });
                document.addEventListener('touchend', closeOnOutside, { passive: true });
            }, 100);

            // Close on escape key
            const closeOnEscape = (e) => {
                if (e.key === 'Escape' && isMenuOpen) {
                    const closeBtn = menu.querySelector('.close, .icon-times, [onclick*="close"], [onclick*="hide"]');
                    if (closeBtn) {
                        closeBtn.click();
                    } else {
                        menu.style.display = 'none';
                    }
                    isMenuOpen = false;
                    currentOpenMenu = null;
                }
            };

            document.addEventListener('keydown', closeOnEscape);
        };

        // Start observing after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', observeMenus);
        } else {
            observeMenus();
        }

        // Also run after a delay to catch dynamically created menus
        setTimeout(observeMenus, 2000);
        setTimeout(observeMenus, 5000);
    }

    function improvePerformance() {
        // Reduce animations on mobile for better performance
        if (isMobile) {
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    * {
                        animation-duration: 0.3s !important;
                        transition-duration: 0.3s !important;
                    }
                    
                    .fade, .slide {
                        animation-duration: 0.2s !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Optimize scrolling performance
        document.addEventListener('touchmove', function(e) {
            // Allow smooth scrolling
        }, { passive: true });
    }

    function addMobileCSSFixes() {
        const mobileCSS = document.createElement('style');
        mobileCSS.textContent = `
            /* Mobile-specific improvements */
            @media (max-width: 768px) {
                /* Improve touch targets */
                button, .icon, [onclick] {
                    min-height: 44px !important;
                    min-width: 44px !important;
                    padding: 8px !important;
                }
                
                /* Better select boxes on mobile */
                select {
                    font-size: 16px !important; /* Prevents zoom on iOS */
                    padding: 12px !important;
                    min-height: 44px !important;
                }
                
                /* Better input fields */
                input, textarea {
                    font-size: 16px !important; /* Prevents zoom on iOS */
                    padding: 12px !important;
                    border-radius: 8px !important;
                }
                
                /* Improve dialog positioning */
                .dialog, .panel, .menu {
                    max-width: 95vw !important;
                    max-height: 90vh !important;
                    overflow-y: auto !important;
                }
                
                /* Better scrollbars */
                ::-webkit-scrollbar {
                    width: 12px !important;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.3) !important;
                    border-radius: 6px !important;
                }
                
                /* Prevent text selection issues */
                .icon, button {
                    -webkit-user-select: none !important;
                    user-select: none !important;
                }
                
                /* Better hover states for touch */
                @media (hover: none) {
                    .hover-effect:hover {
                        background: rgba(255,255,255,0.1) !important;
                    }
                }
                
                /* Fix layout issues */
                body {
                    -webkit-text-size-adjust: 100% !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                
                /* Improve close buttons */
                .close, .icon-times {
                    min-width: 48px !important;
                    min-height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
            }
            
            /* Android WebView specific fixes */
            @media screen and (-webkit-device-pixel-ratio: 2) {
                .high-dpi-fix {
                    transform: scale(1) !important;
                }
            }
        `;
        document.head.appendChild(mobileCSS);
    }

    function fixScrolling() {
        // Improve scroll behavior on mobile
        document.body.style.overscrollBehavior = 'contain';
        
        // Fix momentum scrolling
        const scrollableElements = document.querySelectorAll('.scrollable, .panel, .dialog, .menu');
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowY = 'auto';
        });
    }

    function improveDialogs() {
        // Improve dialog behavior on mobile
        const improveDialog = (dialog) => {
            // Make dialogs more touch-friendly
            dialog.style.touchAction = 'manipulation';
            
            // Improve close button
            const closeBtn = dialog.querySelector('.close, .icon-times, [onclick*="close"]');
            if (closeBtn) {
                closeBtn.style.minWidth = '48px';
                closeBtn.style.minHeight = '48px';
                closeBtn.style.display = 'flex';
                closeBtn.style.alignItems = 'center';
                closeBtn.style.justifyContent = 'center';
            }
        };

        // Apply to existing dialogs
        const dialogs = document.querySelectorAll('[id*="dialog"], [class*="dialog"], [id*="panel"], [class*="panel"]');
        dialogs.forEach(improveDialog);

        // Watch for new dialogs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches('[id*="dialog"], [class*="dialog"], [id*="panel"], [class*="panel"]')) {
                            improveDialog(node);
                        }
                        // Also check children
                        const dialogs = node.querySelectorAll('[id*="dialog"], [class*="dialog"], [id*="panel"], [class*="panel"]');
                        dialogs.forEach(improveDialog);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Debug information for development
    if (isCapacitor || isAndroidWebView) {
        window.mobileCompatibility = {
            isMobile,
            isCapacitor,
            isAndroidWebView,
            userAgent: navigator.userAgent,
            viewport: window.innerWidth + 'x' + window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        };
        
        console.log('Mobile Compatibility Debug Info:', window.mobileCompatibility);
    }

})();