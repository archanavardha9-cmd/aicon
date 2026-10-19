import { ArrowUpRight, Award, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const pillars = [
  {
    icon: Cpu,
    title: 'Engineered Precision',
    desc: 'High-torque copper motors, corrosion-resistant components, and durable polymer cabinets designed for everyday reliability.',
  },
  {
    icon: Zap,
    title: 'Energy Conscious',
    desc: 'Intelligent circuitry and optimized thermal insulation designed to deliver maximum performance with sensible energy use.',
  },
  {
    icon: ShieldCheck,
    title: 'Tested for Indian Homes',
    desc: 'Built to withstand real-world voltage fluctuations, high ambient summer temperatures, and intensive daily laundry or cooking demands.',
  },
  {
    icon: Award,
    title: 'Direct Brand Support',
    desc: 'Prompt assistance directly from AICON Modcon’s Mumbai corporate headquarters via phone, email, and verified digital channels.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section section--ivory why-choose-us">
      <div className="page-shell">
        <div className="section-heading-row">
          <div className="section-heading-row__copy">
            <span className="eyebrow">
              <span className="eyebrow__line" />
              The AICON Standard
            </span>
            <h2 className="display-heading">
              Built on
              <br />
              <em>Innovation, Quality & Trust.</em>
            </h2>
          </div>
          <div className="section-heading-row__aside">
            <p>
              AICON Modcon Private Limited is committed to delivering modern,
              dependable home appliances with honest specifications and dependable construction.
            </p>
            <Link className="inline-link" to="/about">
              Read our company profile <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="pillars-grid">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div className="pillar-card" key={pillar.title}>
                <div className="pillar-card__header">
                  <span className="pillar-card__icon-wrap">
                    <Icon size={24} />
                  </span>
                  <span className="pillar-card__index">
                    0{index + 1}
                  </span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
