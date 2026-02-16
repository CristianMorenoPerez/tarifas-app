export interface Confirmation {
  header: string;
  message: string;
  acceptIcon?: string;
  rejectIcon?: string;
  accept: () => {} | void; // Updated to allow void or empty object return
  reject?: () => {} | void; // Make reject optional
}
