type UserPayload = {
  name: string;
  language: string;
  profileRank: number;
  tierLevel: string;
  avatar: string;
};

export type RoomEvent = {
  type: 'match-found' | 'match-not-found';
  user?: UserPayload;
};
