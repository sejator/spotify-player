
export interface Setting {
  id: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingCreateInput = {
  key: string;
  value: string;
};

export type SettingUpdateInput = {
  id: number;
  value: string;
};
