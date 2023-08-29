export interface ClassItem {
  className: string;
  status: string;
  date?: Date;
}

export interface DataType {
  _index: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  dancerName: string;
  address: string;
  timezone: string;
  mailingList: boolean;
  plans: ClassItem[];
  toExpiration?: ClassItem;
  creationDate: Date;
}
