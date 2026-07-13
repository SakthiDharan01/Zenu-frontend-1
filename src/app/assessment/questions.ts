export type Question = {
  id: number;
  text: string;
  isReverse: boolean;
};

export const PSS_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Today, how often have you been upset because of something that happened unexpectedly?',
    isReverse: false
  },
  {
    id: 2,
    text: 'Today, how often have you felt that you were unable to control the important things in your life?',
    isReverse: false
  },
  {
    id: 3,
    text: "Today, how often have you felt nervous and 'stressed'?",
    isReverse: false
  },
  {
    id: 4,
    text: 'Today, how often have you felt confident about your ability to handle your personal problems?',
    isReverse: true
  },
  {
    id: 5,
    text: 'Today, how often have you felt that things were going your way?',
    isReverse: true
  },
  {
    id: 6,
    text: 'Today, how often have you found that you could not cope with all the things that you had to do?',
    isReverse: false
  },
  {
    id: 7,
    text: 'Today, how often have you been able to control irritations in your life?',
    isReverse: true
  },
  {
    id: 8,
    text: 'Today, how often have you felt that you were on top of things?',
    isReverse: true
  },
  {
    id: 9,
    text: 'Today, how often have you been angered because of things that were outside of your control?',
    isReverse: false
  },
  {
    id: 10,
    text: 'Today, how often have you felt difficulties were piling up so high that you could not overcome them?',
    isReverse: false
  }
];

export const OPTIONS = [
  { label: 'Never', value: 0 },
  { label: 'Almost Never', value: 1 },
  { label: 'Sometimes', value: 2 },
  { label: 'Fairly Often', value: 3 },
  { label: 'Very Often', value: 4 }
];
