export type NavTab = 'home' | 'scorecard' | 'courses' | 'stats';

export type CourseStyle = 'Links' | 'Parkland' | 'Desert';

export type FairwayResult = 'left' | 'hit' | 'right' | null;

export interface TeeBox {
  id: string;
  name: string;
  colorHex: string;
  rating: number;
  slope: number;
  totalYards: number;
  holeYards: number[];
}

export interface HoleSpec {
  number: number;
  par: 3 | 4 | 5;
  strokeIndex: number;
}

export interface Course {
  id: string;
  name: string;
  location: string;
  style: CourseStyle;
  par: number;
  image: string;
  architect: string;
  summary: string;
  holes: HoleSpec[];
  teeBoxes: TeeBox[];
}

export interface HoleScore {
  holeNumber: number;
  par: 3 | 4 | 5;
  strokes: number | null;
  putts: number | null;
  fairway: FairwayResult;
  gir: boolean | null;
}

export interface RoundRecord {
  id: string;
  courseId: string;
  courseName: string;
  courseImage: string;
  teeBoxName: string;
  teeColorHex: string;
  coursePar: number;
  courseRating: number;
  courseSlope: number;
  date: string;
  status: 'in_progress' | 'completed';
  currentHole: number;
  holes: HoleScore[];
}

export interface ClubYardage {
  id: string;
  name: string;
  category: 'Woods' | 'Irons' | 'Wedges' | 'Putter';
  carryYards: number;
  totalYards: number;
  loft: string;
}

export interface TeeTime {
  id: string;
  courseId: string;
  courseName: string;
  dateLabel: string;
  timeLabel: string;
  players: number;
  teeName: string;
}
