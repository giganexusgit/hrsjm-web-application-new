import type {
  RightsArticle,
  RightsArticleFormState,
  RightsStatsSummary,
} from '../types/rights.types';

export const INITIAL_RIGHTS_FIXTURES: RightsArticle[] = [];

export const DEMO_RIGHTS_STATS: RightsStatsSummary = {
  total: 0,
  published: 0,
  drafts: 0,
  archived: 0,
};

export const EMPTY_RIGHTS_ARTICLE_FORM: RightsArticleFormState = {
  coverImageUri: null,
  title: '',
  category: 'Constitution',
  shortDescription: '',
  content: '',
  author: 'Administrator',
  status: 'DRAFT',
  allowComments: true,
  featured: false,
  tags: ['Human Rights', 'Constitution', 'Rights'],
};
