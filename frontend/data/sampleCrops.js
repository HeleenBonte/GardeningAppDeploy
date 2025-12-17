import { createCrop, Month } from '../models/Crop';

function periodLabel(start, end) {
  if (!start && !end) return 'Year-round';
  if (!start) return `Until ${end}`;
  if (!end) return `From ${start}`;
  return `${start} — ${end}`;
}

const sampleCrops = [
  (() => {
    const base = createCrop({
      id: '1',
      name: 'Tomatoes',
      image: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      sowingStart: Month.FEBRUARY,
      sowingEnd: Month.APRIL,
      plantingStart: Month.MAY,
      plantingEnd: Month.JUNE,
      harvestStart: Month.JULY,
      harvestEnd: Month.SEPTEMBER,
      inHouse: false,
      inPots: true,
      inGarden: true,
      inGreenhouse: false,
      cropDescription: 'Tomatoes are warm-season crops that prefer full sun and consistent watering.',
      cropTips: 'Pinch suckers, provide sturdy support, and harvest when fully colored.',
    });
    return {
      ...base,
      subtitle: 'Juicy, versatile fruit — perfect for salads',
      description: base.Description || 'Tomatoes are warm-season crops that prefer full sun and consistent watering.',
      tips: (base.Tips && String(base.Tips).split(/\n|;|,/) ) || ['Pinch suckers', 'Provide sturdy support', 'Harvest when fully colored'],
      maintenance: ['Water regularly', 'Feed with balanced fertiliser', 'Remove diseased leaves'],
      sowPeriod: periodLabel(base.sowingStart, base.sowingEnd),
      plantPeriod: periodLabel(base.plantingStart, base.plantingEnd),
      harvestPeriod: periodLabel(base.harvestStart, base.harvestEnd),
    };
  })(),

  (() => {
    const base = createCrop({
      id: '2',
      name: 'Carrots',
      image: 'https://via.placeholder.com/400x240.png?text=Carrots',
      sowingStart: Month.MARCH,
      sowingEnd: Month.JUNE,
      plantingStart: null,
      plantingEnd: null,
      harvestStart: Month.JULY,
      harvestEnd: Month.OCTOBER,
      inHouse: false,
      inPots: false,
      inGarden: true,
      inGreenhouse: false,
      cropDescription: 'Carrots prefer loose, sandy soil and steady moisture.',
      cropTips: 'Thin seedlings to allow root development; avoid rocky soil.',
    });
    return {
      ...base,
      subtitle: 'Crisp and sweet, great for snacks and stews',
      description: base.Description || 'Carrots prefer loose, sandy soil and steady moisture.',
      tips: (base.Tips && String(base.Tips).split(/\n|;|,/) ) || ['Thin seedlings', 'Avoid rocky soil'],
      maintenance: ['Keep soil loose', 'Mulch to retain moisture'],
      sowPeriod: periodLabel(base.sowingStart, base.sowingEnd),
      plantPeriod: periodLabel(base.plantingStart, base.plantingEnd),
      harvestPeriod: periodLabel(base.harvestStart, base.harvestEnd),
    };
  })(),

  (() => {
    const base = createCrop({
      id: '3',
      name: 'Lettuce',
      image: 'https://via.placeholder.com/400x240.png?text=Lettuce',
      sowingStart: Month.FEBRUARY,
      sowingEnd: Month.SEPTEMBER,
      plantingStart: Month.MARCH,
      plantingEnd: Month.OCTOBER,
      harvestStart: Month.APRIL,
      harvestEnd: Month.NOVEMBER,
      inHouse: false,
      inPots: true,
      inGarden: true,
      inGreenhouse: false,
      cropDescription: 'Lettuce is a cool-season crop that bolts in heat.',
      cropTips: 'Succession sow for continuous harvest; provide shade in hot weather.',
    });
    return {
      ...base,
      subtitle: 'Fresh greens for salads and sandwiches',
      description: base.Description || 'Lettuce is a cool-season crop that bolts in heat.',
      tips: (base.Tips && String(base.Tips).split(/\n|;|,/) ) || ['Succession sow', 'Provide shade in hot weather'],
      maintenance: ['Succession sowing for continuous harvest', 'Protect from heat to avoid bolting'],
      sowPeriod: periodLabel(base.sowingStart, base.sowingEnd),
      plantPeriod: periodLabel(base.plantingStart, base.plantingEnd),
      harvestPeriod: periodLabel(base.harvestStart, base.harvestEnd),
    };
  })(),
];

export default sampleCrops;
