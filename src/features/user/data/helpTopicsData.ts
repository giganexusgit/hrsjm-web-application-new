export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  iconName: string;
  badgeBg: string;
  badgeColor: string;
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'custodial-death',
    title: 'Custodial Death',
    description: 'Report deaths in police or judicial custody and seek urgent legal inquiry',
    keywords: ['custodial death', 'custody', 'police', 'detention', 'torture', 'human rights'],
    iconName: 'ShieldAlert',
    badgeBg: '#FDEBEA',
    badgeColor: '#D45B6A',
  },
  {
    id: 'child-labor',
    title: 'Child Labor',
    description: 'Report underage employment, child exploitation, and rescue support',
    keywords: ['child labor', 'child labour', 'minor', 'children', 'exploitation', 'rescue'],
    iconName: 'Baby',
    badgeBg: '#FDF1CD',
    badgeColor: '#B67D00',
  },
  {
    id: 'consumer-issue',
    title: 'Consumer Issue',
    description: 'Complaints regarding unfair trade practices, fraud, or defective services',
    keywords: ['consumer', 'fraud', 'service', 'goods', 'complaint', 'dispute'],
    iconName: 'FileText',
    badgeBg: '#E8EEFF',
    badgeColor: '#3558B0',
  },
  {
    id: 'communal-violence',
    title: 'Communal Violence',
    description: 'Report communal clashes, hate crimes, and targeted community violence',
    keywords: ['communal violence', 'riot', 'hate crime', 'community', 'violence', 'protection'],
    iconName: 'Users',
    badgeBg: '#FCE4EC',
    badgeColor: '#D75486',
  },
  {
    id: 'domestic-violence',
    title: 'Domestic Violence',
    description: 'Legal recourse, protection orders, and emergency shelter for abuse victims',
    keywords: ['domestic violence', 'abuse', 'family', 'women', 'safety', 'protection'],
    iconName: 'HeartHandshake',
    badgeBg: '#FFEFF3',
    badgeColor: '#DB5F74',
  },
  {
    id: 'dowry-related-issue',
    title: 'Dowry Related Issue',
    description: 'Support and legal action against dowry harassment, coercion, or violence',
    keywords: ['dowry', 'harassment', 'marriage', 'women', 'domestic', 'legal'],
    iconName: 'Scale',
    badgeBg: '#F1EBFF',
    badgeColor: '#6B4EB3',
  },
  {
    id: 'environment-destruction',
    title: 'Environment Destruction',
    description: 'Report illegal pollution, deforestation, toxic dumping, or ecological harm',
    keywords: ['environment', 'pollution', 'deforestation', 'nature', 'ecology', 'destruction'],
    iconName: 'FileSearch',
    badgeBg: '#E7F8EE',
    badgeColor: '#2F9B71',
  },
  {
    id: 'human-trafficking',
    title: 'Human Trafficking',
    description: 'Report forced labor, trafficking networks, and missing persons at risk',
    keywords: ['human trafficking', 'trafficking', 'forced', 'rescue', 'exploitation', 'missing'],
    iconName: 'ShieldAlert',
    badgeBg: '#FDEBED',
    badgeColor: '#C2466A',
  },
  {
    id: 'labor-issue',
    title: 'Labor Issue',
    description: 'Protection of workers rights, unpaid wages, and unsafe working conditions',
    keywords: ['labor', 'labour', 'worker', 'wages', 'employment', 'workplace', 'factory'],
    iconName: 'Briefcase',
    badgeBg: '#EAF1FF',
    badgeColor: '#3C7BFF',
  },
  {
    id: 'rape-or-sexual-harassment',
    title: 'Rape or Sexual Harassment',
    description: 'Confidential emergency support, FIR assistance, and POSH/legal protection',
    keywords: ['rape', 'sexual harassment', 'assault', 'posh', 'women', 'safety', 'justice'],
    iconName: 'UserCheck',
    badgeBg: '#FCE4EC',
    badgeColor: '#D75486',
  },
  {
    id: 'suspicious-death',
    title: 'Suspicious Death',
    description: 'Seek fair investigation and legal intervention in unexplained death cases',
    keywords: ['suspicious death', 'death', 'investigation', 'police', 'inquiry', 'justice'],
    iconName: 'Clock',
    badgeBg: '#FDF5D8',
    badgeColor: '#B17B00',
  },
  {
    id: 'civil-issues',
    title: 'Civil Issues',
    description: 'Support for civil liberties, property/civic disputes, and equal treatment',
    keywords: ['civil', 'civil issues', 'rights', 'dispute', 'civic', 'discrimination'],
    iconName: 'Building2',
    badgeBg: '#E7F8F4',
    badgeColor: '#2A7F73',
  },
  {
    id: 'others',
    title: 'Others',
    description: 'Any other human rights, social justice, or legal aid grievance',
    keywords: ['other', 'others', 'general', 'help', 'grievance', 'support'],
    iconName: 'FileText',
    badgeBg: '#F1F5F9',
    badgeColor: '#475569',
  },
];

