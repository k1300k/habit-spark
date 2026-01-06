// Keyword-based emoji mapping for activities
export const iconKeywords: Record<string, string[]> = {
  // Exercise & Sports
  '🏃‍♂️': ['달리기', '러닝', 'running', 'run', 'jog', '조깅'],
  '🏋️‍♀️': ['운동', '헬스', 'workout', 'gym', 'exercise', '웨이트'],
  '🧘‍♂️': ['요가', 'yoga', '명상', 'meditation', '스트레칭'],
  '🚴‍♂️': ['자전거', 'cycling', 'bike', '사이클'],
  '🏊‍♂️': ['수영', 'swimming', 'swim'],
  '⚽': ['축구', 'soccer', 'football'],
  '🏀': ['농구', 'basketball'],
  '🎾': ['테니스', 'tennis'],
  '🏓': ['탁구', 'ping pong', 'table tennis'],
  '🧗‍♂️': ['클라이밍', 'climbing', '암벽'],
  
  // Learning & Work
  '📚': ['독서', 'reading', 'read', '책', 'book'],
  '✍️': ['글쓰기', 'writing', 'write', '일기', 'journal'],
  '💻': ['코딩', 'coding', '프로그래밍', 'programming', '개발'],
  '🎨': ['그림', 'drawing', 'art', '드로잉', '미술'],
  '🎹': ['피아노', 'piano', '악기', 'music', '음악'],
  '🎸': ['기타', 'guitar'],
  '📝': ['공부', 'study', '학습', 'learning'],
  '🗣️': ['영어', 'english', '언어', 'language', '회화'],
  
  // Health & Wellness
  '💧': ['물', 'water', '물마시기', 'hydration'],
  '💊': ['약', 'medicine', 'pill', '영양제', 'vitamin'],
  '😴': ['수면', 'sleep', '잠', 'rest', '낮잠'],
  '🧘': ['명상', 'meditate', 'mindfulness'],
  '🦷': ['양치', 'brush teeth', '치실', 'floss'],
  
  // Daily Life
  '🧹': ['청소', 'cleaning', 'clean', '정리'],
  '🍳': ['요리', 'cooking', 'cook', '식사준비'],
  '🛒': ['장보기', 'shopping', 'grocery'],
  '🌱': ['식물', 'plant', 'gardening', '가드닝'],
  '🐕': ['산책', 'walk', '강아지산책', 'dog walk'],
  
  // Productivity
  '☑️': ['할일', 'todo', 'task', '업무'],
  '📧': ['이메일', 'email', 'mail'],
  '📞': ['전화', 'call', 'phone'],
  '💰': ['저축', 'saving', '가계부', 'budget'],
  
  // Self-care
  '🧴': ['스킨케어', 'skincare', '피부관리'],
  '💅': ['네일', 'nail', '셀프케어'],
  '🛁': ['목욕', 'bath', '반신욕'],
  
  // Entertainment
  '🎬': ['영화', 'movie', 'film', '넷플릭스'],
  '🎮': ['게임', 'game', 'gaming'],
  '📱': ['sns', '소셜미디어', 'social media'],
};

export function getIconForActivity(name: string): string {
  const lowerName = name.toLowerCase();
  
  for (const [icon, keywords] of Object.entries(iconKeywords)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return icon;
      }
    }
  }
  
  return '🎯'; // Default icon
}

export const activityColors = [
  { name: 'blue', value: 'hsl(207, 90%, 54%)' },
  { name: 'green', value: 'hsl(152, 69%, 45%)' },
  { name: 'yellow', value: 'hsl(45, 93%, 58%)' },
  { name: 'purple', value: 'hsl(262, 83%, 58%)' },
  { name: 'orange', value: 'hsl(25, 95%, 53%)' },
] as const;

export type ActivityColor = typeof activityColors[number]['name'];
