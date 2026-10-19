import { ArrowRight, Building2, CheckCircle2, Shield, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactDetails } from '../data/contact';

const values = [
  {
    number: '01',
    title: 'Innovation',
    description: 'Integrating modern smart technologies—such as 4K HDR displays, Android Smart OS, and energy-efficient motor controls—to make everyday living intuitive and effortless.',
    icon: Sparkles,
  },
  {
    number: '02',
    title: 'Quality',
    description: 'Using resilient polymer cabinets, 100% pure copper motor windings, and rigorous quality testing to ensure every appliance withstands heavy everyday usage.',
    icon: Shield,
  },
  {
    number: '03',
    title: 'Trust',
    description: 'Providing honest product specifications, dependable customer support, and direct manufacturer accountability from our Mumbai corporate office.',
    icon: Users,
  },
];

export default function About() {
  return (
    <main>
      <section className="page-intro page-intro--about">
        <div className="page-shell page-intro__inner">
          <span className="eyebrow eyebrow--light">
            <span className="eyebrow__line" />
            About AICON Modcon
          </span>
          <h1>
            Engineered for Dependability,
            <br />
            Designed for <em>Modern Homes.</em>
          </h1>
          <p>
            AICON Modcon Private Limited brings together a thoughtfully engineered
            portfolio of home appliances crafted for lasting comfort, energy efficiency, and everyday reliability.
          </p>
        </div>
      </section>

      <section className="section section--ivory about-editorial">
        <div className="page-shell about-editorial__grid">
          <div className="about-editorial__aside">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              Corporate Identity
            </span>
            <div className="about-editorial__badge-card">
              <Building2 size={32} className="about-editorial__badge-icon" />
              <strong>{contactDetails.companyName}</strong>
              <span>Incorporated: {contactDetails.incorporationDate}</span>
              <small>CIN: {contactDetails.cin}</small>
              <address>{contactDetails.address}</address>
            </div>
          </div>
          <div className="about-editorial__copy">
            <span className="about-editorial__index">01 — OUR MISSION</span>
            <h2 className="display-heading">
              Practical Innovation,
              <br />
              Uncompromising <em>Quality.</em>
            </h2>
            <p>
              Headquartered in Mumbai, Maharashtra, AICON Modcon Private Limited was founded
              to deliver a higher standard of home appliances tailored specifically for Indian households.
              From extreme summer heat and frequent voltage swings to demanding daily laundry cycles,
              we design and curate appliances that perform consistently season after season.
            </p>
            <p>
              Our growing product portfolio spans six core consumer categories: Smart LED Televisions,
              Semi-Automatic Washing Machines, Desert & Personal Air Coolers, Inverter Split Air Conditioners,
              Aeroflow Ceiling Fans, Heavy-Duty Mixer Grinders, and Storage Water Heaters.
            </p>
            <div className="about-editorial__bullets">
              <div className="about-bullet">
                <CheckCircle2 size={16} className="bullet-icon" />
                <span>Engineered specifically to handle Indian voltage fluctuations and water conditions.</span>
              </div>
              <div className="about-bullet">
                <CheckCircle2 size={16} className="bullet-icon" />
                <span>Dedicated customer care and responsive regional distributor support.</span>
              </div>
              <div className="about-bullet">
                <CheckCircle2 size={16} className="bullet-icon" />
                <span>Transparent product specifications and straightforward warranty assistance.</span>
              </div>
            </div>
            <div className="about-editorial__actions">
              <Link className="button button--gold" to="/products">
                Explore the Catalogue <ArrowRight size={16} />
              </Link>
              <Link className="button button--secondary" to="/contact">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--light values-section">
        <div className="page-shell">
          <div className="values-section__heading">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              Guiding Principles
            </span>
            <h2 className="display-heading">
              Our Core
              <br />
              <em>Brand Values.</em>
            </h2>
            <p>
              Every product that bears the AICON name is developed with these three fundamental commitments in mind.
            </p>
          </div>
          <div className="values-grid">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article className="value-card" key={value.number}>
                  <div className="value-card__top">
                    <span className="value-card__number">{value.number}</span>
                    <Icon size={24} className="value-card__icon" />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}