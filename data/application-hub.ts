import { APPLICATION_HUB_CARD_IMAGES } from '@/data/application-assets';

/** Application hub card order — matches mega-menu IA. */
export type ApplicationHubCardId =
  | 'retail_service'
  | 'manufacturing'
  | 'medical_lab'
  | 'education';

export type ApplicationHubCard = {
  id: ApplicationHubCardId;
  href: `/applications/${string}`;
  image: string;
  altKey:
    | 'application_hub_retail_service'
    | 'application_hub_manufacturing'
    | 'application_hub_medical_lab'
    | 'application_hub_education';
};

export const APPLICATION_HUB_CARDS: readonly ApplicationHubCard[] = [
  {
    id: 'retail_service',
    href: '/applications/retail-service',
    image: APPLICATION_HUB_CARD_IMAGES.retailService,
    altKey: 'application_hub_retail_service',
  },
  {
    id: 'manufacturing',
    href: '/applications/manufacturing',
    image: APPLICATION_HUB_CARD_IMAGES.manufacturing,
    altKey: 'application_hub_manufacturing',
  },
  {
    id: 'medical_lab',
    href: '/applications/medical-lab',
    image: APPLICATION_HUB_CARD_IMAGES.medicalLab,
    altKey: 'application_hub_medical_lab',
  },
  {
    id: 'education',
    href: '/applications/education',
    image: APPLICATION_HUB_CARD_IMAGES.education,
    altKey: 'application_hub_education',
  },
] as const;

export const APPLICATION_HUB_PATH = '/applications';
