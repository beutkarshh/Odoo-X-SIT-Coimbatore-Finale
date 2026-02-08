import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { LogOut, User, ChevronDown, Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../lib/services/notificationService.js';

const PillNav = ({
  logo = '/logo.svg',
  logoAlt = 'SubsManager',
  items = [],
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#714B67',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#ffffff',
  pillTextColor = '#714B67',
  onLogout,
  showUserMenu = true,
  title = { main: 'SubsManager', sub: null },
  initialLoadAnimation = true
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
			if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
				setIsNotifMenuOpen(false);
			}
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshUnreadCount = async () => {
    const result = await notificationService.getUnreadCount();
    if (result.success) {
      setUnreadCount(Number(result.data?.count || 0));
    }
  };

  const refreshNotifications = async () => {
    const result = await notificationService.getAll({ limit: 6 });
    if (result.success) {
      setNotifications(Array.isArray(result.data) ? result.data : []);
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshUnreadCount();
    // light polling so the bell updates without manual refresh
    const id = window.setInterval(() => refreshUnreadCount(), 15000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.4,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }
  };

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': pillTextColor,
    '--nav-h': '42px',
    '--logo': '36px',
    '--pill-pad-x': '18px',
    '--pill-gap': '3px'
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <nav
          className={`w-full flex items-center justify-between h-16 ${className}`}
          aria-label="Primary"
          style={cssVars}
        >
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link
              to={items[0]?.path || '/'}
              aria-label="Home"
              onMouseEnter={handleLogoEnter}
              ref={logoRef}
              className="rounded-full p-1.5 inline-flex items-center justify-center overflow-hidden"
              style={{
                width: 'var(--nav-h)',
                height: 'var(--nav-h)',
                background: 'var(--base)'
              }}
            >
              <img src={logo} alt={logoAlt} ref={logoImgRef} className="w-full h-full object-contain block" />
            </Link>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-foreground">{title.main}</span>
              {title.sub && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {title.sub}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div
            ref={navItemsRef}
            className="relative items-center rounded-full hidden lg:flex"
            style={{
              height: 'var(--nav-h)',
              background: 'var(--base)'
            }}
          >
            <ul
              role="menubar"
              className="list-none flex items-stretch m-0 p-[3px] h-full"
              style={{ gap: 'var(--pill-gap)' }}
            >
              {items.map((item, i) => {
                const isActive = location.pathname === item.path;

                const pillStyle = {
                  background: isActive ? 'var(--base)' : 'var(--pill-bg)',
                  color: isActive ? 'var(--pill-bg)' : 'var(--pill-text)',
                  paddingLeft: 'var(--pill-pad-x)',
                  paddingRight: 'var(--pill-pad-x)'
                };

                const PillContent = (
                  <>
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                      style={{
                        background: 'var(--base)',
                        willChange: 'transform'
                      }}
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack relative inline-flex items-center gap-2 leading-[1] z-[2]">
                      {item.icon && <item.icon size={16} />}
                      <span
                        className="pill-label relative z-[2] inline-block leading-[1]"
                        style={{ willChange: 'transform' }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover absolute left-0 top-0 z-[3] inline-flex items-center gap-2"
                        style={{
                          color: 'var(--hover-text)',
                          willChange: 'transform, opacity'
                        }}
                        aria-hidden="true"
                      >
                        {item.icon && <item.icon size={16} />}
                        {item.label}
                      </span>
                    </span>
                    {isActive && (
                      <span
                        className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-2 h-2 rounded-full z-[4]"
                        style={{ background: 'var(--base)' }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                );

                const basePillClasses =
                  'relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-medium text-[14px] leading-[0] whitespace-nowrap cursor-pointer px-0 transition-colors';

                return (
                  <li key={item.path} role="none" className="flex h-full">
                    <Link
                      role="menuitem"
                      to={item.path}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.label}
                      onMouseEnter={() => !isActive && handleEnter(i)}
                      onMouseLeave={() => !isActive && handleLeave(i)}
                    >
                      {PillContent}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right side - User menu & Theme */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user && (
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={async () => {
                    const next = !isNotifMenuOpen;
                    setIsNotifMenuOpen(next);
                    if (next) {
                      await Promise.all([refreshUnreadCount(), refreshNotifications()]);
                    }
                  }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-muted"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="text-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">Notifications</p>
                      <button
                        onClick={async () => {
                          await notificationService.markAllRead();
                          await Promise.all([refreshUnreadCount(), refreshNotifications()]);
                        }}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckCheck size={14} />
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-96 overflow-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={async () => {
                              if (!n.isRead) {
                                await notificationService.markRead(n.id);
                                await Promise.all([refreshUnreadCount(), refreshNotifications()]);
                              }
                              if (n.linkUrl) {
                                window.location.href = n.linkUrl;
                              }
                              setIsNotifMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/60 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className={`text-sm ${n.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'} truncate`}>
                                  {n.title}
                                </p>
                                {n.message && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {n.message}
                                  </p>
                                )}
                              </div>
                              {!n.isRead && <span className="mt-1 w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-sm text-muted-foreground text-center">No notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {showUserMenu && user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full transition-colors hover:bg-muted"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              ref={hamburgerRef}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative"
              style={{
                width: 'var(--nav-h)',
                height: 'var(--nav-h)',
                background: 'var(--base)'
              }}
            >
              <span
                className="hamburger-line w-4 h-0.5 rounded origin-center"
                style={{ background: 'var(--pill-bg)' }}
              />
              <span
                className="hamburger-line w-4 h-0.5 rounded origin-center"
                style={{ background: 'var(--pill-bg)' }}
              />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="lg:hidden absolute top-full left-4 right-4 rounded-2xl shadow-lg z-[998] origin-top border border-border"
        style={{
          ...cssVars,
          background: 'var(--base)'
        }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {items.map(item => {
            const isActive = location.pathname === item.path;
            const defaultStyle = {
              background: isActive ? 'transparent' : 'var(--pill-bg)',
              color: isActive ? 'var(--pill-bg)' : 'var(--pill-text)'
            };

            const linkClasses =
              'flex items-center gap-3 py-3 px-4 text-[14px] font-medium rounded-xl transition-all duration-200';

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={linkClasses}
                  style={defaultStyle}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon size={18} />}
                  {item.label}
                </Link>
              </li>
            );
          })}
          {showUserMenu && (
            <li className="border-t border-white/20 mt-1 pt-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout?.();
                }}
                className="flex items-center gap-3 py-3 px-4 text-[14px] font-medium rounded-xl w-full text-left"
                style={{ background: 'var(--pill-bg)', color: '#ef4444' }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default PillNav;
