import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Triggers a modal/popup when the visitor scrolls downward and the site footer
 * begins entering the viewport. Re-arms only after the visitor scrolls upward
 * enough that the footer leaves the trigger area.
 */
export function useFooterTrigger({
  routeKey,
  disabled = false,
  footerSelector = '.site-footer',
}) {
  const [openState, setOpenState] = useState({ open: false, routeKey: '' });
  const isOpen = !disabled && openState.open && openState.routeKey === routeKey;

  const isOpenRef = useRef(false);
  const armedRef = useRef(false);
  const readyRef = useRef(false);
  const prevFooterTopRef = useRef(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const close = useCallback(() => {
    const footerEl = document.querySelector(footerSelector);
    if (footerEl) {
      prevFooterTopRef.current = footerEl.getBoundingClientRect().top;
    }
    setOpenState({ open: false, routeKey });
  }, [footerSelector, routeKey]);

  useEffect(() => {
    if (disabled) {
      return undefined;
    }

    isOpenRef.current = false;
    readyRef.current = false;
    armedRef.current = false;
    prevFooterTopRef.current = null;

    let rafId = null;
    let initRaf1 = null;
    let initRaf2 = null;
    let disposed = false;

    const getViewportHeight = () =>
      window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;

    const snapshotFooterPosition = () => {
      const footerEl = document.querySelector(footerSelector);
      if (!footerEl) return;
      const rect = footerEl.getBoundingClientRect();
      prevFooterTopRef.current = rect.top;
      armedRef.current = true;
      readyRef.current = true;
    };

    // Wait two frames so ScrollRestoration's scrollTo(0, 0) completes first
    initRaf1 = window.requestAnimationFrame(() => {
      initRaf2 = window.requestAnimationFrame(() => {
        if (!disposed) {
          snapshotFooterPosition();
        }
      });
    });

    const evaluate = () => {
      rafId = null;
      if (disposed || !readyRef.current || isOpenRef.current) return;

      const footerEl = document.querySelector(footerSelector);
      if (!footerEl) return;

      const rect = footerEl.getBoundingClientRect();
      if (rect.height === 0 && rect.width === 0) return;

      const viewportHeight = getViewportHeight();
      const prevTop = prevFooterTopRef.current;
      prevFooterTopRef.current = rect.top;

      if (prevTop === null) return;

      const movedDownward = rect.top < prevTop - 0.5;
      const footerEnteringViewport = rect.top < viewportHeight - 4 && rect.bottom > 0;
      const footerLeftTriggerArea = rect.top >= viewportHeight + 12;

      if (footerLeftTriggerArea) {
        armedRef.current = true;
        return;
      }

      if (armedRef.current && movedDownward && footerEnteringViewport) {
        armedRef.current = false;
        setOpenState({ open: true, routeKey });
      }
    };

    const handleScroll = () => {
      if (disposed || !readyRef.current || isOpenRef.current) return;
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(evaluate);
    };

    const handleResize = () => {
      if (disposed || isOpenRef.current) return;
      const footerEl = document.querySelector(footerSelector);
      if (!footerEl) return;
      const rect = footerEl.getBoundingClientRect();
      const viewportHeight = getViewportHeight();
      prevFooterTopRef.current = rect.top;
      if (rect.top >= viewportHeight + 12) {
        armedRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.visualViewport?.addEventListener('resize', handleResize, { passive: true });

    return () => {
      disposed = true;
      if (initRaf1 !== null) window.cancelAnimationFrame(initRaf1);
      if (initRaf2 !== null) window.cancelAnimationFrame(initRaf2);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [routeKey, disabled, footerSelector]);

  return { isOpen, close };
}
