import { Tier } from '@prisma/client';

export type CodingMinigamePayload = {
  tiers: Pick<Tier, 'name' | 'description' | 'tierRange'>[];
  user: {
    name: string;
    language: string;
    profileRank: number;
    tierLevel: string;
  };
};
