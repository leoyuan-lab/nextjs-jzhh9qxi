import {
  APPLICATION_EDUCATION_MEDIA,
  APPLICATION_MANUFACTURING_MEDIA,
  APPLICATION_MEDICAL_LAB_MEDIA,
  APPLICATION_RETAIL_SERVICE_MEDIA,
  type ApplicationImmersiveMedia,
} from '@/data/application-media';
import type { getMessages } from '@/lib/messages';

export type ApplicationImmersiveCopyKey =
  | 'applications_manufacturing'
  | 'applications_medical_lab'
  | 'applications_retail_service'
  | 'applications_education';

export type ApplicationImmersiveCopy =
  ReturnType<typeof getMessages>['pages'][ApplicationImmersiveCopyKey];

export type ApplicationImmersiveSpecSecondary = 'rUltra' | 'rCore';

export type ApplicationImmersiveConfig = {
  copyKey: ApplicationImmersiveCopyKey;
  media: ApplicationImmersiveMedia;
  inquirySource: string;
  industryZh: string;
  industryEn: string;
  specSecondary: ApplicationImmersiveSpecSecondary;
  inquiryModels: readonly ['r-Lite', 'r-Ultra'] | readonly ['r-Lite', 'r-Core'];
};

export const MANUFACTURING_IMMERSIVE_CONFIG: ApplicationImmersiveConfig = {
  copyKey: 'applications_manufacturing',
  media: APPLICATION_MANUFACTURING_MEDIA,
  inquirySource: 'application_manufacturing',
  industryZh: '智能制造',
  industryEn: 'Smart Manufacturing',
  specSecondary: 'rUltra',
  inquiryModels: ['r-Lite', 'r-Ultra'],
};

export const MEDICAL_LAB_IMMERSIVE_CONFIG: ApplicationImmersiveConfig = {
  copyKey: 'applications_medical_lab',
  media: APPLICATION_MEDICAL_LAB_MEDIA,
  inquirySource: 'application_medical_lab',
  industryZh: '医疗与实验室',
  industryEn: 'Medical & Lab',
  specSecondary: 'rCore',
  inquiryModels: ['r-Lite', 'r-Core'],
};

export const RETAIL_SERVICE_IMMERSIVE_CONFIG: ApplicationImmersiveConfig = {
  copyKey: 'applications_retail_service',
  media: APPLICATION_RETAIL_SERVICE_MEDIA,
  inquirySource: 'application_retail_service',
  industryZh: '零售与服务',
  industryEn: 'Retail & Service',
  specSecondary: 'rCore',
  inquiryModels: ['r-Lite', 'r-Core'],
};

export const EDUCATION_IMMERSIVE_CONFIG: ApplicationImmersiveConfig = {
  copyKey: 'applications_education',
  media: APPLICATION_EDUCATION_MEDIA,
  inquirySource: 'application_education',
  industryZh: '教育与科研',
  industryEn: 'Education & Research',
  specSecondary: 'rCore',
  inquiryModels: ['r-Lite', 'r-Core'],
};
