import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, PencilLine, X } from 'lucide-react';
import {
  buildWhatsAppUrl,
  previewBookingWhatsAppNumber,
  projectBrandName,
} from '../data/contact';
import { useFooterTrigger } from '../hooks/useFooterTrigger';
import './WebsitePreviewPopup.css';

const LAPTOP_VIEWPORT = { width: 1280, height: 800 };
const PHONE_VIEWPORT = { width: 390, height: 780 };

function ScaledDeviceIframe({ src, title, logicalWidth, logicalHeight }) {
  const screenRef = useRef(null);
  const [scale, setScale] = useState(0.2);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const loaded = loadedSrc === src;

  useEffect(() => {
    const screenEl = screenRef.current;
    if (!screenEl) return undefined;

    const updateScale = () => {
      const rect = screenEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nextScale = Math.min(
        rect.width / logicalWidth,
        rect.height / logicalHeight,
      );
      setScale(nextScale);
    };

    updateScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateScale);
      observer.observe(screenEl);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [logicalWidth, logicalHeight]);

  return (
    <div className="preview-device__screen" ref={screenRef}>
      {!loaded && (
        <div className="preview-device__loading" aria-hidden="true">
          <span className="preview-device__spinner" />
        </div>
      )}
      <div
        className="preview-device__scaler"
        style={{
          width: `${logicalWidth}px`,
          height: `${logicalHeight}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <iframe
          src={src}
          title={title}
          className={`preview-device__iframe ${loaded ? 'is-loaded' : ''}`}
          loading="eager"
          tabIndex={-1}
          aria-hidden="true"
          onLoad={() => setLoadedSrc(src)}
        />
      </div>
    </div>
  );
}

export default function WebsitePreviewPopup({ isPreviewMode = false }) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;
  const { isOpen, close } = useFooterTrigger({
    routeKey,
    disabled: isPreviewMode,
    footerSelector: '.site-footer',
  });

  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    params.set('preview', '1');
    return `${location.pathname}?${params.toString()}`;
  }, [location.pathname, location.search]);

  const primaryWhatsAppHref = useMemo(() => {
    const message = `Hi, I’ve reviewed the ${projectBrandName} website preview and would like to discuss proceeding with the project. Please share the next steps for the 50% kickoff payment based on our agreed project fee and the remaining development work. Thank you.`;
    return buildWhatsAppUrl(previewBookingWhatsAppNumber, message);
  }, []);

  const secondaryWhatsAppHref = useMemo(() => {
    const message = `Hi, I’ve reviewed the ${projectBrandName} website preview. I’d like to request a few changes before proceeding. The changes I’d like are: `;
    return buildWhatsAppUrl(previewBookingWhatsAppNumber, message);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;
    document.body.classList.add('no-scroll');

    const focusTimer = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('no-scroll');
      if (
        previousFocusRef.current &&
        typeof previousFocusRef.current.focus === 'function'
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, close]);

  if (isPreviewMode || !isOpen) {
    return null;
  }

  return (
    <div
      className="preview-popup-backdrop"
      role="presentation"
      onClick={close}
    >
      <div
        className="preview-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-popup-title"
        aria-describedby="preview-popup-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="preview-popup__topbar">
          <span className="eyebrow preview-popup__eyebrow">
            <span className="eyebrow__line" aria-hidden="true" />
            WEBSITE PREVIEW
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            className="preview-popup__close"
            onClick={close}
            aria-label="Close website preview"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="preview-popup__grid">
          <div className="preview-popup__stage" aria-label="Website device previews">
            <div className="preview-laptop">
              <div className="preview-laptop__bezel">
                <ScaledDeviceIframe
                  src={previewUrl}
                  title={`${projectBrandName} desktop preview`}
                  logicalWidth={LAPTOP_VIEWPORT.width}
                  logicalHeight={LAPTOP_VIEWPORT.height}
                />
              </div>
              <div className="preview-laptop__base" aria-hidden="true">
                <span className="preview-laptop__notch" />
              </div>
            </div>

            <div className="preview-phone">
              <div className="preview-phone__bezel">
                <ScaledDeviceIframe
                  src={previewUrl}
                  title={`${projectBrandName} mobile preview`}
                  logicalWidth={PHONE_VIEWPORT.width}
                  logicalHeight={PHONE_VIEWPORT.height}
                />
              </div>
            </div>
          </div>

          <div className="preview-popup__content">
            <span className="eyebrow preview-popup__eyebrow-desktop">
              <span className="eyebrow__line" aria-hidden="true" />
              WEBSITE PREVIEW
            </span>

            <h2 id="preview-popup-title" className="preview-popup__title">
              Your Website Is Ready for the <em>Next Step</em>
            </h2>

            <p id="preview-popup-description" className="preview-popup__subtitle">
              You’ve reviewed the frontend preview. Let’s discuss the next phase of development.
            </p>

            <div className="preview-popup__payment-card">
              <div className="preview-popup__payment-header">
                <span className="preview-popup__payment-kicker">RESERVE YOUR PROJECT</span>
                <span className="preview-popup__payment-label">Kickoff Booking Deposit</span>
              </div>
              <p className="preview-popup__payment-amount">
                50% of the agreed project fee
              </p>
              <p className="preview-popup__payment-note">
                Applied toward the total project cost; the remaining balance follows the agreed proposal.
              </p>
            </div>

            <div className="preview-popup__actions">
              <a
                className="button preview-popup__btn-primary"
                href={primaryWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>Discuss on WhatsApp</span>
              </a>

              <a
                className="button preview-popup__btn-secondary"
                href={secondaryWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PencilLine size={15} aria-hidden="true" />
                <span>I’d like to request a few changes</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
