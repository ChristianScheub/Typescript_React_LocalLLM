import { HuggingFaceAuthServiceImpl } from '@services/huggingfaceAuth/logic/HuggingFaceAuthServiceImpl';
import type { IHuggingFaceAuthService } from '@services/huggingfaceAuth/IHuggingFaceAuthService';

export const HuggingFaceAuthService: IHuggingFaceAuthService = HuggingFaceAuthServiceImpl;

export type { IHuggingFaceAuthService };

