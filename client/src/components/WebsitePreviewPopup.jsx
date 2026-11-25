import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  MessageCircle,
  PencilLine,
  X,
} from 'lucide-react';
import {
  buildPreviewWhatsAppDrafts,
  buildWhatsAppUrl,
  getFormattedPreviewDeadline,
  previewBookingWhatsAppNumber,
  previewRetentionPolicy,
  projectBrandName,
} from '../data/contact';
import { useFooterTrigger } from '../hooks/useFooterTrigger';
import './WebsitePreviewPopup.css';

const LAPTOP_VIEWPORT = { width: 1280, height: 800 };
const PHONE_VIEWPORT = { width: 390, height: 780 };

const PROJECT_STAGES = [
  { label: 'Frontend Website Preview', status: 'Ready', state: 'complete' },
  { label: 'Enquiry System & Remaining Development', status: 'Not Started', state: 'current' },
  { label: 'Business Website Launch', status: 'Pending', state: 'pending' },
];

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

  const deadlineDate = useMemo(() => getFormattedPreviewDeadline(), []);

  const { activateHref, changesHref } = useMemo(() => {
    const { activateMessage, changesMessage } = buildPreviewWhatsAppDrafts();
    return {
      activateHref: buildWhatsAppUrl(
        previewBookingWhatsAppNumber,
        activateMessage,
      ),
      changesHref: buildWhatsAppUrl(
        previewBookingWhatsAppNumber,
        changesMessage,
      ),
    };
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
              A Preview Can Impress. An Active Website Can <em>Work for Your Business.</em>
            </h2>

            <ol className="preview-tracker" aria-label="Project progress tracker">
              {PROJECT_STAGES.map((stage, index) => {
                const isLast = index === PROJECT_STAGES.length - 1;
                const isComplete = stage.state === 'complete';
                const isCurrent = stage.state === 'current';

                return (
                  <li
                    key={stage.label}
                    className={`preview-tracker__step ${
                      isComplete ? 'is-complete' : isCurrent ? 'is-current' : 'is-pending'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <div className="preview-tracker__rail" aria-hidden="true">
                      <span className="preview-tracker__dot">
                        {isComplete && <Check size={10} strokeWidth={3} />}
                      </span>
                      {!isLast && <span className="preview-tracker__line" />}
                    </div>

                    <div className="preview-tracker__row">
                      <span className="preview-tracker__label">{stage.label}</span>
                      <span className="preview-tracker__status">{stage.status}</span>
                    </div>
                  </li>
                );
              })}
            </ol>

            {deadlineDate && (
              <div className="preview-popup__deadline-notice" role="note">
                <AlertTriangle size={14} className="preview-popup__deadline-icon" aria-hidden="true" />
                <div>
                  <p className="preview-popup__deadline-heading">
                    PREVIEW DEADLINE: {deadlineDate}
                  </p>
                  <p className="preview-popup__deadline-body">
                    If the 50% kickoff payment is not received by this date, this website preview
                    and its associated project data may be removed from{' '}
                    {previewRetentionPolicy.storageLocation}. Continuing afterward may require a
                    new project setup and fee.
                  </p>
                </div>
              </div>
            )}

            <div className="preview-popup__actions">
              <a
                className="button preview-popup__btn-primary"
                href={activateHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={15} aria-hidden="true" />
                <span>ACTIVATE MY BUSINESS WEBSITE</span>
              </a>

              <p className="preview-popup__action-caption">
                Discuss your package and finalise project booking.
              </p>

              <a
                className="preview-popup__link-secondary"
                href={changesHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PencilLine size={12} aria-hidden="true" />
                <span>I’d Like to Request Changes</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
