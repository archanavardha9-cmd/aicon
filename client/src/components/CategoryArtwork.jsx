import {
  CookingPot,
  Droplets,
  Fan,
  Home,
  Speaker,
  Tv,
  WashingMachine,
  Wind,
} from 'lucide-react';

const icons = {
  television: Tv,
  washing: WashingMachine,
  cooler: Wind,
  fan: Fan,
  kitchen: CookingPot,
  heating: Droplets,
  home: Home,
  speaker: Speaker,
};

export default function CategoryArtwork({ category, number }) {
  const Icon = icons[category.icon];

  return (
    <div
      className={`category-art category-art--${category.tone}`}
      aria-label={`Illustrative category artwork for ${category.label}; not an AICON product photograph`}
      role="img"
    >
      <span className="category-art__orbit category-art__orbit--one" />
      <span className="category-art__orbit category-art__orbit--two" />
      <span className="category-art__index">{number}</span>
      <span className="category-art__icon" aria-hidden="true">
        <Icon size={72} strokeWidth={1.1} />
      </span>
      <span className="category-art__caption">
        <span className="category-art__caption-dot" />
        Illustrative category art
      </span>
    </div>
  );
}
