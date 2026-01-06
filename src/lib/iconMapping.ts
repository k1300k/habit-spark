import { 
  Activity, 
  BookOpen, 
  Droplets, 
  Brain,
  Dumbbell,
  Bike,
  Waves,
  Target,
  Pencil,
  Code,
  Palette,
  Music,
  Guitar,
  GraduationCap,
  Languages,
  Pill,
  Moon,
  Sparkles,
  Brush,
  UtensilsCrossed,
  ShoppingCart,
  Sprout,
  Dog,
  CheckSquare,
  Mail,
  Phone,
  PiggyBank,
  Bath,
  Film,
  Gamepad2,
  Smartphone,
  Heart,
  Coffee,
  Cigarette,
  Wine,
  Salad,
  Footprints,
  Clock,
  Sun,
  type LucideIcon
} from 'lucide-react';

// Icon mapping with Lucide icons
export const iconKeywords: Record<string, { keywords: string[]; icon: LucideIcon }> = {
  'running': {
    keywords: ['달리기', '러닝', 'running', 'run', 'jog', '조깅'],
    icon: Activity
  },
  'workout': {
    keywords: ['운동', '헬스', 'workout', 'gym', 'exercise', '웨이트'],
    icon: Dumbbell
  },
  'yoga': {
    keywords: ['요가', 'yoga', '스트레칭'],
    icon: Sparkles
  },
  'meditation': {
    keywords: ['명상', 'meditation', 'meditate', 'mindfulness'],
    icon: Brain
  },
  'cycling': {
    keywords: ['자전거', 'cycling', 'bike', '사이클'],
    icon: Bike
  },
  'swimming': {
    keywords: ['수영', 'swimming', 'swim'],
    icon: Waves
  },
  'reading': {
    keywords: ['독서', 'reading', 'read', '책', 'book'],
    icon: BookOpen
  },
  'writing': {
    keywords: ['글쓰기', 'writing', 'write', '일기', 'journal'],
    icon: Pencil
  },
  'coding': {
    keywords: ['코딩', 'coding', '프로그래밍', 'programming', '개발'],
    icon: Code
  },
  'art': {
    keywords: ['그림', 'drawing', 'art', '드로잉', '미술'],
    icon: Palette
  },
  'music': {
    keywords: ['피아노', 'piano', '악기', 'music', '음악'],
    icon: Music
  },
  'guitar': {
    keywords: ['기타', 'guitar'],
    icon: Guitar
  },
  'study': {
    keywords: ['공부', 'study', '학습', 'learning'],
    icon: GraduationCap
  },
  'language': {
    keywords: ['영어', 'english', '언어', 'language', '회화'],
    icon: Languages
  },
  'water': {
    keywords: ['물', 'water', '물마시기', 'hydration'],
    icon: Droplets
  },
  'medicine': {
    keywords: ['약', 'medicine', 'pill', '영양제', 'vitamin'],
    icon: Pill
  },
  'sleep': {
    keywords: ['수면', 'sleep', '잠', 'rest', '낮잠'],
    icon: Moon
  },
  'cleaning': {
    keywords: ['청소', 'cleaning', 'clean', '정리'],
    icon: Brush
  },
  'cooking': {
    keywords: ['요리', 'cooking', 'cook', '식사준비'],
    icon: UtensilsCrossed
  },
  'shopping': {
    keywords: ['장보기', 'shopping', 'grocery'],
    icon: ShoppingCart
  },
  'gardening': {
    keywords: ['식물', 'plant', 'gardening', '가드닝'],
    icon: Sprout
  },
  'walking': {
    keywords: ['산책', 'walk', '강아지산책', 'dog walk', '걷기'],
    icon: Footprints
  },
  'dog': {
    keywords: ['강아지', 'dog', '펫'],
    icon: Dog
  },
  'todo': {
    keywords: ['할일', 'todo', 'task', '업무'],
    icon: CheckSquare
  },
  'email': {
    keywords: ['이메일', 'email', 'mail'],
    icon: Mail
  },
  'call': {
    keywords: ['전화', 'call', 'phone'],
    icon: Phone
  },
  'saving': {
    keywords: ['저축', 'saving', '가계부', 'budget'],
    icon: PiggyBank
  },
  'bath': {
    keywords: ['목욕', 'bath', '반신욕', '스킨케어', 'skincare'],
    icon: Bath
  },
  'movie': {
    keywords: ['영화', 'movie', 'film', '넷플릭스'],
    icon: Film
  },
  'gaming': {
    keywords: ['게임', 'game', 'gaming'],
    icon: Gamepad2
  },
  'social': {
    keywords: ['sns', '소셜미디어', 'social media'],
    icon: Smartphone
  },
  'health': {
    keywords: ['건강', 'health', '체크'],
    icon: Heart
  },
  'coffee': {
    keywords: ['커피', 'coffee', '카페인'],
    icon: Coffee
  },
  'smoking': {
    keywords: ['담배', 'smoking', 'smoke', '금연'],
    icon: Cigarette
  },
  'alcohol': {
    keywords: ['술', 'alcohol', '음주', 'drink', 'wine'],
    icon: Wine
  },
  'diet': {
    keywords: ['식단', 'diet', '다이어트', '건강식'],
    icon: Salad
  },
  'morning': {
    keywords: ['기상', '아침', 'morning', 'wake'],
    icon: Sun
  },
  'time': {
    keywords: ['시간', 'time', '루틴'],
    icon: Clock
  },
};

export function getIconForActivity(name: string): string {
  const lowerName = name.toLowerCase();
  
  for (const [iconKey, { keywords }] of Object.entries(iconKeywords)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return iconKey;
      }
    }
  }
  
  return 'default'; // Default icon key
}

export function getIconComponent(iconKey: string): LucideIcon {
  if (iconKey === 'default' || !iconKeywords[iconKey]) {
    return Target;
  }
  return iconKeywords[iconKey].icon;
}

export const activityColors = [
  { name: 'gray', value: 'hsl(220, 13%, 30%)' },
  { name: 'blue', value: 'hsl(207, 90%, 54%)' },
  { name: 'green', value: 'hsl(152, 69%, 45%)' },
  { name: 'purple', value: 'hsl(262, 83%, 58%)' },
  { name: 'orange', value: 'hsl(25, 95%, 53%)' },
] as const;

export type ActivityColor = typeof activityColors[number]['name'];
