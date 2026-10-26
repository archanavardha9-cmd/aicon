export const categories = [
  {
    id: 'televisions',
    label: 'LED Televisions',
    terms: 'television televisions tv led',
    icon: 'television',
    tone: 'blue',
    image: '/images/products/aicon-smart-tv.png',
    description: 'Frameless 4K Ultra HD and Full HD Smart displays with vivid HDR contrast and Dolby Audio.',
  },
  {
    id: 'washing-machines',
    label: 'Washing Machines',
    terms: 'washing machine washing-machines laundry',
    icon: 'washing',
    tone: 'sage',
    image: '/images/products/aicon-semi-automatic-washing-machine.png',
    description: 'Durable twin-tub semi-automatic washers with high-torque pulsators and rust-free cabinets.',
  },
  {
    id: 'air-coolers',
    label: 'Air Coolers',
    terms: 'air cooler air-coolers cooling',
    icon: 'cooler',
    tone: 'ice',
    image: '/images/products/aicon-air-cooler.png',
    description: 'High-air-delivery desert coolers and efficient inverter split air conditioners.',
  },
  {
    id: 'fans',
    label: 'Fans',
    terms: 'fan fans',
    icon: 'fan',
    tone: 'clay',
    image: '/images/products/aicon-aeroflow-ceiling-fan.png',
    description: 'High-speed aerodynamically balanced ceiling fans with 100% pure copper winding.',
  },
  {
    id: 'kitchen-appliances',
    label: 'Kitchen Appliances',
    terms: 'kitchen appliance appliances cooking',
    icon: 'kitchen',
    tone: 'ochre',
    image: '/images/products/aicon-smart-mixer-grinder-750w.png',
    description: 'Heavy-duty 750W mixer grinders with hardened stainless steel blades and overload protection.',
  },
  {
    id: 'water-heating',
    label: 'Water Heating',
    terms: 'water heating heater heaters geyser immersion',
    icon: 'heating',
    tone: 'plum',
    image: '/images/products/aicon-storage-water-heater-25l.png',
    description: 'High-pressure storage geysers, immersion rods, and advanced thermal cut-off water heating solutions.',
  },
  {
    id: 'room-heating',
    label: 'Room Heating',
    terms: 'room heater heaters sun quartz carbon warmth winter',
    icon: 'heating',
    tone: 'ember',
    image: '/images/products/aicon-sun-heater-14.png',
    description: 'Carbon sun heaters and quartz metal heaters with tip-over safety, oscillation, and efficient warmth.',
  },
  {
    id: 'home-appliances',
    label: 'Home Appliances',
    terms: 'home appliance appliances iron dry steam ironing garment care',
    icon: 'home',
    tone: 'clay',
    image: '/images/products/aicon-dry-iron.png',
    description: 'Reliable household essentials including heavy-duty dry irons and everyday convenience appliances.',
  },
  {
    id: 'audio',
    label: 'Audio & Speakers',
    terms: 'audio speaker speakers tower multimedia sound bluetooth bass music',
    icon: 'speaker',
    tone: 'blue',
    image: '/images/products/aicon-multimedia-tower-speaker.png',
    description: 'High-performance multimedia tower speakers delivering 120W RMS crystal-clear audio, powerful bass, and wireless Bluetooth connectivity.',
  },
];

export function filterCategories(items, categoryId = 'all', query = '') {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((category) => {
    const matchesCategory =
      categoryId === 'all' || category.id === categoryId;
    const searchableText =
      `${category.label} ${category.terms ?? ''}`.toLowerCase();

    return matchesCategory && searchableText.includes(normalizedQuery);
  });
}
