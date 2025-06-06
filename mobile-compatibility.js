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
    }    function initMobileCompatibility() {
        // 1. Improve viewport
        improveViewport();
        
        // 2. Add mobile-specific CSS (enhanced for scrolling)
        addMobileCSSFixes();
        
        // 3. Fix touch events
        fixTouchEvents();
        
        // 4. Fix menu closing issues
        fixMenuClosing();
        
        // 5. Improve scrolling (enhanced)
        fixScrolling();
        
        // 6. Improve performance
        improvePerformance();
        
        // 7. Enhance dialogs (enhanced)
        improveDialogs();
        
        console.log('Mobile compatibility enhancements applied - enhanced version');
    }function fixTouchEvents() {
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
        mobileCSS.textContent = `            /* Mobile-specific improvements - HEAVILY REDUCED for Samsung S24 */
            @media (max-width: 768px) {
                /* Improve touch targets - VERY SMALL for mobile display */
                button, .icon, [onclick] {
                    min-height: 24px !important;
                    min-width: 24px !important;
                    padding: 2px !important;
                    font-size: 11px !important;
                }
                
                /* Specific menu element fixes - MUCH SMALLER for S24 */
                .menu button, .dialog button, .panel button {
                    min-height: 20px !important;
                    min-width: auto !important;
                    padding: 1px 4px !important;
                    font-size: 10px !important;
                    line-height: 1.1 !important;
                    margin: 1px !important;
                }
                
                /* Dropdown and select improvements - REDUCED */
                .menu select, .dialog select, .panel select {
                    min-height: 20px !important;
                    padding: 1px 3px !important;
                    font-size: 10px !important;
                    margin: 1px !important;
                }
                
                /* Icon size adjustments - SMALLER */
                .menu .icon, .dialog .icon, .panel .icon {
                    min-height: 18px !important;
                    min-width: 18px !important;
                    padding: 1px !important;
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
                  /* Improve dialog positioning - enhanced for better scrolling */
                .dialog, .panel, .menu, .ui-dialog {
                    max-width: 95vw !important;
                    max-height: 90vh !important;
                    overflow: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                    overscroll-behavior: contain !important;
                }
                  /* Better scrollbars - enhanced for touch */
                ::-webkit-scrollbar {
                    width: 14px !important;
                    height: 14px !important;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.4) !important;
                    border-radius: 7px !important;
                    border: 2px solid transparent !important;
                    background-clip: content-box !important;
                    min-height: 30px !important;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.6) !important;
                }
                
                ::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1) !important;
                    border-radius: 7px !important;
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
                  /* Improve close buttons - REDUCED size */
                .close, .icon-times {
                    min-width: 32px !important;
                    min-height: 32px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }}
              /* High-DPI device specific fixes (Samsung S24, etc.) - ULTRA REDUCED */
            @media screen and (min-device-pixel-ratio: 2.5) {
                /* Extremely small sizes for very high-DPI devices like S24 */
                .menu, .dialog, .panel {
                    font-size: 9px !important;
                    line-height: 1.1 !important;
                }
                
                .menu button, .dialog button, .panel button {
                    min-height: 16px !important;
                    padding: 0px 2px !important;
                    font-size: 8px !important;
                    border-radius: 1px !important;
                    margin: 0px !important;
                }
                
                .menu select, .dialog select, .panel select {
                    min-height: 16px !important;
                    padding: 0px 2px !important;
                    font-size: 8px !important;
                    margin: 0px !important;
                }
                
                .menu .icon, .dialog .icon, .panel .icon {
                    min-height: 14px !important;
                    min-width: 14px !important;
                    padding: 0px !important;
                }
                
                /* Ultra-compact close buttons for high-DPI */
                .close, .icon-times {
                    min-width: 20px !important;
                    min-height: 20px !important;
                    font-size: 8px !important;
                }
                
                /* Reduce spacing and margins everywhere */
                .menu *, .dialog *, .panel * {
                    margin: 0px !important;
                    padding: 1px !important;
                }
                
                /* Make containers more compact */
                .menu, .dialog, .panel {
                    padding: 2px !important;
                    max-width: 98vw !important;
                    max-height: 95vh !important;
                }            }
            
            /* Additional ultra-compact rules for all mobile devices */
            @media (max-width: 480px) {
                /* Force ultra-compact layout for small screens */
                div, span, label, input, select, button {
                    font-size: 9px !important;
                    line-height: 1.0 !important;
                }
                
                /* Make all interactive elements tiny */
                button, select, input[type="button"], input[type="submit"] {
                    min-height: 18px !important;
                    min-width: auto !important;
                    padding: 1px 3px !important;
                    font-size: 9px !important;
                    border-width: 1px !important;
                }
                
                /* Compact dropdown lists */
                option {
                    font-size: 9px !important;
                    padding: 1px !important;
                }
                
                /* Reduce all margins and paddings */
                .menu > *, .dialog > *, .panel > * {
                    margin: 1px !important;
                    padding: 1px !important;
                }
                
                /* Force containers to be more compact */
                .menu, .dialog, .panel, [role="dialog"] {
                    padding: 3px !important;
                    border-width: 1px !important;
                    max-width: 95vw !important;
                    max-height: 90vh !important;
                    overflow: auto !important;
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
    }    function fixScrolling() {
        // Improve scroll behavior on mobile - enhanced for universal compatibility
        document.body.style.overscrollBehavior = 'contain';
        
        // Fix momentum scrolling for existing elements
        const scrollableElements = document.querySelectorAll('.scrollable, .panel, .dialog, .menu, .ui-dialog, [role="dialog"]');
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowY = 'auto';
            element.style.overscrollBehavior = 'contain';
        });
        
        // Ensure smooth scrolling for the entire page
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add momentum scrolling support for touch devices
        if ('ontouchstart' in window) {
            document.addEventListener('touchmove', function(e) {
                // Allow smooth scrolling, don't prevent default
            }, { passive: true });
        }
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