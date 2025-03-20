type TwitterUser = {
  id: string;
  name: string;
  username: string;
};

type TwitterMeta = {
  result_count: number;
  next_token?: string; // Optional, since it may not always be present
};

export type TwitterResponse = {
  data: TwitterUser[] | undefined;
  meta: TwitterMeta;
  error: string | undefined;
  fromCache: boolean;
};
